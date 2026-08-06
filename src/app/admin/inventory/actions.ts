"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidateInventory(productId?: string) {
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

/** Save cost, sell price, and every size/colour stock for one product. */
export async function saveInventoryProduct(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  if (!productId) redirect("/admin/inventory?error=save");

  const costPrice = Math.max(0, Number(formData.get("costPrice") || 0));
  const price = Math.max(0, Number(formData.get("price") || 0));

  if (!price) {
    redirect(`/admin/inventory?error=price&focus=${productId}`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) redirect("/admin/inventory?error=save");

  await prisma.product.update({
    where: { id: productId },
    data: { costPrice, price },
  });

  for (const variant of product.variants) {
    const raw = formData.get(`stock_${variant.id}`);
    if (raw == null || raw === "") continue;
    const stock = Math.max(0, Math.floor(Number(raw)));
    if (Number.isNaN(stock)) continue;
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stock },
    });
  }

  revalidateInventory(productId);
  redirect(`/admin/inventory?ok=saved&focus=${productId}`);
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
