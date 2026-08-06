import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { CategoryMosaic } from "@/components/store/CategoryMosaic";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, featured: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: { where: { published: true } } },
        },
        products: {
          where: { published: true },
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    }),
  ]);

  const categoryTiles = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat._count.products,
    imageUrl: cat.products[0]?.images[0]?.url ?? null,
  }));

  return (
    <>
      {/* Campaign hero — compact on mobile, 3-column on desktop */}
      <section className="relative overflow-hidden pt-20 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(215,177,183,0.35),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <div className="relative grid min-h-[58vh] overflow-hidden rounded-2xl bg-ink-soft md:min-h-[72vh] md:grid-cols-[1fr_1.15fr_1fr] md:rounded-3xl">
            <div
              className="hidden bg-cover bg-center md:block"
              style={{
                backgroundImage: "url('/uploads/hero-left.png')",
              }}
            />

            <div className="relative flex flex-col items-center justify-center px-5 py-12 text-center md:px-10 md:py-16">
              <div
                className="absolute inset-0 md:hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(58,58,58,0.55), rgba(180,132,144,0.78)), url('/uploads/hero-left.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative z-10 w-full max-w-md">
                <p className="fade-up text-[0.68rem] uppercase tracking-[0.38em] text-white drop-shadow md:text-label">
                  — New collection —
                </p>
                <h1 className="fade-up-delay mt-4 font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-[0.04em] text-white drop-shadow md:mt-5 md:text-6xl md:text-ivory md:drop-shadow-none lg:text-7xl">
                  Bodice
                  <span className="mt-3 block text-2xl tracking-[0.28em] text-white drop-shadow md:text-label md:drop-shadow-none md:text-3xl">
                    by Kueen
                  </span>
                </h1>
                <p className="fade-up-delay-2 mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/95 drop-shadow md:mt-6 md:text-base md:text-ivory md:drop-shadow-none">
                  Basic tops, Nova tops, rhinestone cowl necks, bodysuits, and
                  tube tops — plus pre-order for a wider range of styles.
                </p>
                <div className="fade-up-delay-2 mt-8 flex w-full flex-col items-stretch gap-3 md:mt-9 md:flex-row md:flex-wrap md:items-center md:justify-center">
                  <Link href="/shop" className="btn-primary w-full md:w-auto">
                    Explore products
                  </Link>
                  <Link
                    href="/shop?availability=PREORDER"
                    className="btn-ghost-hero w-full md:w-auto"
                  >
                    Pre-orders
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="hidden bg-cover bg-center md:block"
              style={{
                backgroundImage: "url('/uploads/hero-right.png')",
              }}
            />
          </div>
        </div>
      </section>

      {/* Stylish category mosaic */}
      <section className="mx-auto max-w-7xl px-5 pt-14 md:px-10 md:pt-20">
        <div className="mb-6 md:mb-8">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-label">
            Browse
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase tracking-[0.04em] text-ivory md:text-5xl">
            Shop by categories
          </h2>
        </div>
        <CategoryMosaic categories={categoryTiles} />
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-24">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-12">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-label">
              Featured
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ivory md:text-5xl">
              Discover your best pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 rounded-full border border-label/30 bg-ink-soft/50 px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-label transition hover:border-label hover:bg-champagne hover:text-[var(--on-accent)]"
          >
            View all
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-stone">
            Collection launching soon. Visit the admin to add products.
          </p>
        ) : (
          <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                imageUrl={product.images[0]?.url}
                imageUrls={product.images.map((img) => img.url)}
                availability={product.availability}
                preorderEta={product.preorderEta}
              />
            ))}
          </div>
        )}
      </section>

      {/* Editorial story band */}
      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
        <div className="overflow-hidden rounded-2xl border border-champagne/15 bg-ink-soft/40 md:rounded-3xl">
          <div className="grid items-stretch md:grid-cols-2">
            <div
              className="min-h-[240px] bg-cover bg-center md:min-h-[400px]"
              style={{
                backgroundImage: "url('/uploads/story-band.png')",
              }}
            />
            <div className="flex flex-col justify-center px-5 py-12 md:px-14 md:py-20">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-label">
                The house
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-ivory md:text-5xl">
                Tops you can take home — and more on pre-order
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-stone md:mt-6 md:text-base">
                Shop our core tops collection in stock, or pre-order from a much
                wider range of styles. We source special pieces on request and
                confirm your ETA after checkout.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-9">
                <Link href="/about" className="btn-primary w-full sm:w-auto">
                  Our story
                </Link>
                <Link href="/size-guide" className="btn-ghost w-full sm:w-auto">
                  Size guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
