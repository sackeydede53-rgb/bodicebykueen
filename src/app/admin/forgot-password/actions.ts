"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function asString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function recoveryKey() {
  return (
    process.env.ADMIN_RESET_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    ""
  );
}

export async function resetAdminPasswordWithRecovery(formData: FormData) {
  const email = asString(formData.get("email")).toLowerCase();
  const recovery = asString(formData.get("recoveryKey"));
  const password = asString(formData.get("password"));
  const confirm = asString(formData.get("confirmPassword"));
  const expected = recoveryKey();

  if (!email || !recovery || !password || !confirm) {
    redirect("/admin/forgot-password?error=missing");
  }
  if (!expected) {
    redirect("/admin/forgot-password?error=notconfigured");
  }
  if (recovery !== expected) {
    redirect("/admin/forgot-password?error=recovery");
  }
  if (password.length < 8) {
    redirect("/admin/forgot-password?error=short");
  }
  if (password !== confirm) {
    redirect("/admin/forgot-password?error=match");
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    // Same message path as bad recovery — avoid email enumeration noise for single-admin shop
    redirect("/admin/forgot-password?error=recovery");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  redirect("/admin/login?updated=password");
}
