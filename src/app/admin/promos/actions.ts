"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function createPromo(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const discountType = String(formData.get("discountType") || "PERCENT") as
    | "PERCENT"
    | "FIXED";
  const discountValue = Number(formData.get("discountValue") || 0);
  if (!code || !discountValue) return;

  await prisma.promoCode.create({
    data: {
      code,
      discountType,
      discountValue,
      active: true,
    },
  });
  revalidatePath("/admin/promos");
}

export async function togglePromo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.promoCode.update({
    where: { id },
    data: { active: !active },
  });
  revalidatePath("/admin/promos");
}
