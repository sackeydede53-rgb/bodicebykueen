"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function asString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function updateAdminProfile(formData: FormData) {
  const session = await requireAdmin();
  const userId = session.user?.id;
  if (!userId) redirect("/admin/login");

  const name = asString(formData.get("name"));
  const email = asString(formData.get("email")).toLowerCase();
  const currentPassword = asString(formData.get("currentPassword"));

  if (!name || !email || !currentPassword) {
    redirect("/admin/account?error=missing");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/account?error=email");
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) redirect("/admin/login");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    redirect("/admin/account?error=password");
  }

  const emailTaken = await prisma.adminUser.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (emailTaken) {
    redirect("/admin/account?error=taken");
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: { name, email },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/account");

  // Refresh the session so sidebar name/email match the database.
  await signOut({
    redirectTo:
      email !== user.email
        ? "/admin/login?updated=email"
        : "/admin/login?updated=profile",
  });
}

export async function updateAdminPassword(formData: FormData) {
  const session = await requireAdmin();
  const userId = session.user?.id;
  if (!userId) redirect("/admin/login");

  const currentPassword = asString(formData.get("currentPassword"));
  const newPassword = asString(formData.get("newPassword"));
  const confirmPassword = asString(formData.get("confirmPassword"));

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/admin/account?error=missing");
  }

  if (newPassword.length < 8) {
    redirect("/admin/account?error=short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/admin/account?error=match");
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) redirect("/admin/login");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    redirect("/admin/account?error=password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/account");
  redirect("/admin/account?ok=password");
}
