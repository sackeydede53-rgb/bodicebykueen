import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Categories
      </h1>

      <form
        action={createCategory}
        className="mt-8 grid max-w-xl gap-3 border border-[#d8d0c4] bg-white p-6"
      >
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <input id="description" name="description" className="input" />
        </div>
        <button type="submit" className="admin-btn">
          Add category
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between gap-4 border border-[#d8d0c4] bg-white px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-[#8a8174]">
                {cat.slug} · {cat._count.products} products
              </p>
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={cat.id} />
              <button type="submit" className="text-danger underline">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
