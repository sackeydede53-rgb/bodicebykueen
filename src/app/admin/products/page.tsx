import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { availabilityLabel, isPreorder } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      variants: true,
      _count: { select: { variants: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const publishedCount = products.filter((p) => p.published).length;
  const preorderCount = products.filter((p) => p.availability === "PREORDER").length;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#8a8174]">
            Catalogue
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[0.02em]">
            Products
          </h1>
          <p className="mt-3 max-w-lg text-sm text-[#6b6358]">
            {products.length} pieces · {publishedCount} published · {preorderCount}{" "}
            on pre-order
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn">
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="admin-panel mt-10 px-8 py-16 text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl">
            No pieces yet
          </p>
          <p className="mt-3 text-sm text-[#8a8174]">
            Add your first look to open the collection.
          </p>
          <Link href="/admin/products/new" className="admin-btn mt-8">
            Create product
          </Link>
        </div>
      ) : (
        <div className="admin-panel mt-10 overflow-hidden">
          <div className="hidden border-b border-black/[0.06] px-5 py-3 text-[0.62rem] uppercase tracking-[0.18em] text-[#8a8174] lg:grid lg:grid-cols-[minmax(0,2.2fr)_1fr_1fr_1.1fr_0.7fr_auto] lg:gap-4">
            <span>Product</span>
            <span>Price</span>
            <span>Availability</span>
            <span>Status</span>
            <span>Variants</span>
            <span className="text-right">Edit</span>
          </div>

          <ul>
            {products.map((product) => {
              const stockTotal = product.variants.reduce(
                (sum, v) => sum + v.stock,
                0,
              );
              const preorder = isPreorder(product.availability);

              return (
                <li
                  key={product.id}
                  className="admin-row border-b border-black/[0.05] last:border-b-0"
                >
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="grid items-center gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,2.2fr)_1fr_1fr_1.1fr_0.7fr_auto]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e7e0d4]">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[0.6rem] uppercase tracking-[0.14em] text-[#8a8174]">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-[family-name:var(--font-display)] text-2xl tracking-wide">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8a8174]">
                          {product.category?.name ?? "Uncategorized"}
                          {!preorder ? ` · ${stockTotal} in stock` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="lg:hidden text-[0.62rem] uppercase tracking-[0.14em] text-[#8a8174]">
                        Price ·{" "}
                      </span>
                      <span className="font-medium">{formatGhs(product.price)}</span>
                    </div>

                    <div>
                      <span
                        className={
                          preorder
                            ? "admin-badge admin-badge-champagne"
                            : product.availability === "AVAILABLE"
                              ? "admin-badge admin-badge-ink"
                              : "admin-badge admin-badge-success"
                        }
                      >
                        {availabilityLabel(product.availability)}
                      </span>
                      {preorder && product.preorderEta && (
                        <p className="mt-1.5 text-xs text-[#8a8174]">
                          {product.preorderEta}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={
                          product.published
                            ? "admin-badge admin-badge-ink"
                            : "admin-badge admin-badge-soft"
                        }
                      >
                        {product.published ? "Published" : "Draft"}
                      </span>
                      {product.featured && (
                        <span className="admin-badge admin-badge-champagne">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-[#5c5348]">
                      <span className="lg:hidden text-[0.62rem] uppercase tracking-[0.14em] text-[#8a8174]">
                        Variants ·{" "}
                      </span>
                      {product._count.variants}
                    </div>

                    <div className="hidden text-right text-[0.65rem] uppercase tracking-[0.16em] text-[#8a8174] lg:block">
                      Edit →
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
