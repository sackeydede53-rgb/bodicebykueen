"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function revalidateInventory(productId?: string) {
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/shop");
  if (productId) {
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop", "layout");
  }
}

/** Save cost, sell price, and every size/colour stock for one product. */
export async function saveInventoryProduct(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  if (!productId) redirect("/admin/inventory?error=save");

  const costPrice = Math.max(0, Number(formData.get("costPrice") || 0));
  const price = Math.max(0, Number(formData.get("price") || 0));

  if (!price) {
    redirect(`/admin/inventory?edit=${productId}&error=price`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) redirect("/admin/inventory?error=save");

  const stockUpdates: { id: string; stock: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock_")) continue;
    const variantId = key.slice("stock_".length);
    if (!variantId) continue;
    const belongs = product.variants.some((v) => v.id === variantId);
    if (!belongs) continue;
    const stock = Math.max(0, Math.floor(Number(String(value))));
    if (Number.isNaN(stock)) continue;
    stockUpdates.push({ id: variantId, stock });
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        costPrice,
        price,
        // bump updatedAt so “just saved” ordering works
        updatedAt: new Date(),
      },
    }),
    ...stockUpdates.map((u) =>
      prisma.productVariant.update({
        where: { id: u.id },
        data: { stock: u.stock },
      }),
    ),
  ]);

  revalidateInventory(productId);
  // Keep this product open; confirmation renders under the editor
  redirect(`/admin/inventory?edit=${productId}&ok=saved`);
}

/** Reset every product cost to 0 and clear expense log. */
export async function zeroAllInventoryMoney() {
  await requireAdmin();
  await prisma.$transaction([
    prisma.product.updateMany({ data: { costPrice: 0 } }),
    prisma.inventoryExpense.deleteMany({}),
  ]);
  revalidateInventory();
  redirect("/admin/inventory?ok=zeroed");
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
