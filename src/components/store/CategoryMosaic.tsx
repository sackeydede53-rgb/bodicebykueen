import Link from "next/link";
import { safariSafeImageUrl } from "@/lib/utils";

export type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  count: number;
  imageUrl?: string | null;
};

type Props = {
  categories: CategoryTile[];
};

export function CategoryMosaic({ categories }: Props) {
  if (!categories.length) return null;

  const [featured, second, third, ...rest] = categories;

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {featured && (
        <CategoryCard
          category={featured}
          className="col-span-1 row-span-2 min-h-[280px] md:min-h-[420px]"
          large
        />
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        {second && (
          <CategoryCard
            category={second}
            className="min-h-[134px] flex-1 md:min-h-[202px]"
          />
        )}
        {third && (
          <CategoryCard
            category={third}
            className="min-h-[134px] flex-1 md:min-h-[202px]"
          />
        )}
      </div>

      {rest.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          className="min-h-[160px] md:min-h-[200px]"
        />
      ))}
    </div>
  );
}

function CategoryCard({
  category,
  className = "",
  large = false,
}: {
  category: CategoryTile;
  className?: string;
  large?: boolean;
}) {
  const countLabel =
    category.count === 1 ? "1 piece" : `${category.count} pieces`;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`group relative block overflow-hidden rounded-2xl ${className}`}
    >
      {category.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safariSafeImageUrl(category.imageUrl)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #f8f2f3 0%, #eac5cc 50%, #d7b1b7 100%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent transition group-hover:from-black/75" />
      <div
        className={`relative z-10 flex h-full flex-col justify-end p-4 md:p-5 ${
          large ? "md:p-6" : ""
        }`}
      >
        <p
          className={`font-[family-name:var(--font-display)] tracking-[0.06em] text-white ${
            large ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
          }`}
        >
          {category.name}
        </p>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/85">
          {countLabel}
        </p>
      </div>
    </Link>
  );
}
