"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const costPrice = Math.max(0, Number(formData.get("costPrice") || 0));
  const categoryId = String(formData.get("categoryId") || "") || null;
  const availability = String(formData.get("availability") || "AVAILABLE") as
    | "AVAILABLE"
    | "IN_STOCK"
    | "PREORDER";
  const preorderEta = String(formData.get("preorderEta") || "") || null;
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const imageUrls = String(formData.get("imageUrls") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const sizes = String(formData.get("sizes") || "S,M,L")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const colors = String(formData.get("colors") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const stock = Number(formData.get("stock") || 0);

  if (!name || !description || !price) {
    throw new Error("Name, description, and price are required");
  }
  if (!colors.length) {
    throw new Error("Select at least one colour");
  }
  if (!sizes.length) {
    throw new Error("Add at least one size");
  }

  let slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      costPrice,
      categoryId,
      availability,
      preorderEta: availability === "PREORDER" ? preorderEta : null,
      featured,
      published,
      images: {
        create: imageUrls.map((url, i) => ({
          url,
          alt: name,
          sortOrder: i,
        })),
      },
      variants: {
        create: colors.flatMap((color) =>
          sizes.map((size) => ({
            size,
            color,
            stock: availability === "PREORDER" ? 0 : stock,
          })),
        ),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const costPrice = Math.max(0, Number(formData.get("costPrice") || 0));
  const categoryId = String(formData.get("categoryId") || "") || null;
  const availability = String(formData.get("availability") || "AVAILABLE") as
    | "AVAILABLE"
    | "IN_STOCK"
    | "PREORDER";
  const preorderEta = String(formData.get("preorderEta") || "") || null;
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const imageUrls = String(formData.get("imageUrls") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      price,
      costPrice,
      categoryId,
      availability,
      preorderEta: availability === "PREORDER" ? preorderEta : null,
      featured,
      published,
    },
  });

  await prisma.productImage.deleteMany({ where: { productId } });
  if (imageUrls.length) {
    await prisma.productImage.createMany({
      data: imageUrls.map((url, i) => ({
        productId,
        url,
        alt: name,
        sortOrder: i,
      })),
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  redirect(`/admin/products/${productId}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateVariantStock(formData: FormData) {
  await requireAdmin();
  const variantId = String(formData.get("variantId"));
  const stock = Number(formData.get("stock") || 0);
  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });
  revalidatePath(`/admin/products/${variant.productId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
}

export async function addVariant(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const size = String(formData.get("size") || "").trim();
  const color = String(formData.get("color") || "Black").trim();
  const stock = Number(formData.get("stock") || 0);
  if (!size || !color) return;

  await prisma.productVariant.create({
    data: { productId, size, color, stock },
  });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

/** Add a colour across all existing sizes (or default sizes if none). */
export async function addColorToProduct(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const color = String(formData.get("color") || "").trim();
  const stock = Number(formData.get("stock") || 0);
  if (!productId || !color) return;

  const existing = await prisma.productVariant.findMany({
    where: { productId },
  });
  const sizes = Array.from(new Set(existing.map((v) => v.size)));
  const sizesToCreate = sizes.length ? sizes : ["XS", "S", "M", "L", "XL"];

  for (const size of sizesToCreate) {
    const already = existing.some(
      (v) => v.size === size && v.color.toLowerCase() === color.toLowerCase(),
    );
    if (already) continue;
    await prisma.productVariant.create({
      data: { productId, size, color, stock },
    });
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}
