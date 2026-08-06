import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";

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
    }),
  ]);

  return (
    <>
      {/* Campaign hero inspired by the Dribbble fashion concept */}
      <section className="relative overflow-hidden pt-20 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(215,177,183,0.35),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <div className="relative grid min-h-[72vh] overflow-hidden bg-ink-soft md:grid-cols-[1fr_1.15fr_1fr]">
            <div
              className="hidden bg-cover bg-center md:block"
              style={{
                backgroundImage: "url('/uploads/hero-left.png')",
              }}
            />

            <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center md:px-10">
              <div
                className="absolute inset-0 md:hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(111,111,111,0.45), rgba(215,177,183,0.72)), url('/uploads/hero-left.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative z-10">
                <p className="fade-up text-[0.68rem] uppercase tracking-[0.38em] text-champagne">
                  — New collection —
                </p>
                <h1 className="fade-up-delay mt-5 font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-[0.04em] text-ivory md:text-6xl lg:text-7xl">
                  Bodice
                  <span className="mt-3 block text-2xl tracking-[0.28em] text-champagne md:text-3xl">
                    by Kueen
                  </span>
                </h1>
                <p className="fade-up-delay-2 mx-auto mt-6 max-w-sm text-sm leading-relaxed text-ivory/80 md:text-base">
                  Basic tops, Nova tops, rhinestone cowl necks, bodysuits, and
                  tube tops — plus pre-order for a wider range of styles.
                </p>
                <div className="fade-up-delay-2 mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/shop" className="btn-primary">
                    Explore products
                  </Link>
                  <Link href="/shop?availability=PREORDER" className="btn-ghost">
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

      {/* Category browse — restrained chips, not a pill cluster overload */}
      <section className="mx-auto max-w-7xl px-5 pt-16 md:px-10 md:pt-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-champagne">
              Browse
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ivory md:text-5xl">
              Shop by category
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/shop"
              className="border border-champagne bg-champagne px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--on-accent)]"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="border border-champagne/30 px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-champagne transition hover:border-champagne hover:text-ivory"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured capsule */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-champagne">
              Featured
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ivory md:text-5xl">
              Ready to wear
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-[0.68rem] uppercase tracking-[0.2em] text-champagne transition hover:text-ivory md:inline"
          >
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-stone">
            Collection launching soon. Visit the admin to add products.
          </p>
        ) : (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
      <section className="border-y border-champagne/10 bg-ink-soft/40">
        <div className="mx-auto grid max-w-7xl items-stretch md:grid-cols-2">
          <div
            className="min-h-[420px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
          <div className="flex flex-col justify-center px-6 py-16 md:px-14 md:py-20">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-champagne">
              The house
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-ivory md:text-5xl">
              Tops you can take home — and more on pre-order
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/70 md:text-base">
              Shop our core tops collection in stock, or pre-order from a much
              wider range of styles. We source special pieces on request and
              confirm your ETA after checkout.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/about" className="btn-primary">
                Our story
              </Link>
              <Link href="/size-guide" className="btn-ghost">
                Size guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
