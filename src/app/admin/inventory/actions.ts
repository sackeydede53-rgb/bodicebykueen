"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function updateProductCost(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const costPrice = Math.max(0, Number(formData.get("costPrice") || 0));
  if (!productId) return;

  await prisma.product.update({
    where: { id: productId },
    data: { costPrice },
  });

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
}

export async function quickUpdateStock(formData: FormData) {
  await requireAdmin();
  const variantId = String(formData.get("variantId") || "");
  const stock = Math.max(0, Math.floor(Number(formData.get("stock") || 0)));
  if (!variantId) return;

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/products/${variant.productId}`);
  revalidatePath("/admin");
}

export async function addInventoryExpense(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const amount = Math.max(0, Number(formData.get("amount") || 0));
  const category = String(formData.get("category") || "OTHER").trim() || "OTHER";
  const note = String(formData.get("note") || "").trim() || null;
  const spentAtRaw = String(formData.get("spentAt") || "").trim();

  if (!title || !amount) {
    redirect("/admin/inventory?error=expense");
  }

  const spentAt = spentAtRaw ? new Date(spentAtRaw) : new Date();

  await prisma.inventoryExpense.create({
    data: {
      title,
      amount,
      category,
      note,
      spentAt: Number.isNaN(spentAt.getTime()) ? new Date() : spentAt,
    },
  });

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?ok=expense");
}

export async function deleteInventoryExpense(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.inventoryExpense.delete({ where: { id } });
  revalidatePath("/admin/inventory");
}
