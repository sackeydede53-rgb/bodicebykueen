import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopSearch } from "@/components/store/ShopSearch";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  category?: string;
  availability?: string;
  size?: string;
  q?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(params.category
        ? { category: { slug: params.category } }
        : {}),
      ...(params.availability === "PREORDER" ||
      params.availability === "IN_STOCK" ||
      params.availability === "AVAILABLE"
        ? { availability: params.availability }
        : {}),
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q } },
              { description: { contains: params.q } },
            ],
          }
        : {}),
      ...(params.size
        ? { variants: { some: { size: params.size } } }
        : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const sizes = ["XS", "S", "M", "L", "XL"];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:px-10">
      <div className="mb-10">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-champagne">
          Collection
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory md:text-6xl">
          Shop
        </h1>
      </div>

      <div className="mb-10">
        <ShopSearch initialQuery={params.q ?? ""} />
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <FilterChip href="/shop" active={!params.category && !params.availability && !params.size}>
          All
        </FilterChip>
        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            active={params.category === cat.slug}
          >
            {cat.name}
          </FilterChip>
        ))}
        <FilterChip
          href="/shop?availability=IN_STOCK"
          active={params.availability === "IN_STOCK"}
        >
          Ready to ship
        </FilterChip>
        <FilterChip
          href="/shop?availability=PREORDER"
          active={params.availability === "PREORDER"}
        >
          Pre-order
        </FilterChip>
        {sizes.map((size) => (
          <FilterChip
            key={size}
            href={`/shop?size=${size}${params.category ? `&category=${params.category}` : ""}`}
            active={params.size === size}
          >
            {size}
          </FilterChip>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-stone">No pieces match these filters.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
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
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] transition",
        active
          ? "border-champagne bg-champagne text-ink"
          : "border-champagne/30 text-champagne hover:border-champagne",
      )}
    >
      {children}
    </Link>
  );
}
