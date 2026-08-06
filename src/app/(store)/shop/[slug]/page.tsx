import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  availabilityLabel,
  isPreorder,
  isProductOutOfStock,
} from "@/lib/availability";
import { formatGhs } from "@/lib/utils";
import { AddToCartForm } from "@/components/store/AddToCartForm";
import { ProductImageSlider } from "@/components/store/ProductImageSlider";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: true,
    },
  });

  if (!product || !product.published) notFound();

  const preorder = isPreorder(product.availability);
  const outOfStock = isProductOutOfStock(
    product.availability,
    product.variants,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:px-10">
      <Link
        href="/shop"
        className="text-[0.7rem] uppercase tracking-[0.22em] text-champagne hover:text-ivory"
      >
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductImageSlider images={product.images} productName={product.name} />

        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-label">
            {outOfStock
              ? "Out of stock"
              : availabilityLabel(product.availability)}
            {product.category ? ` · ${product.category.name}` : ""}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory">
            {product.name}
          </h1>
          <p className="mt-4 text-xl text-champagne">{formatGhs(product.price)}</p>
          {preorder && product.preorderEta && (
            <p className="mt-2 text-sm text-stone">
              Estimated availability: {product.preorderEta}
            </p>
          )}
          <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-ivory/75">
            {product.description}
          </p>

          <div className="mt-10">
            <AddToCartForm
              productId={product.id}
              productName={product.name}
              slug={product.slug}
              unitPrice={product.price}
              imageUrl={product.images[0]?.url}
              isPreorder={preorder}
              preorderEta={product.preorderEta}
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
