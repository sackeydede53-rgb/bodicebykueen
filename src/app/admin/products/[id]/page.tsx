import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  addColorToProduct,
  addVariant,
  deleteProduct,
  updateProduct,
  updateVariantStock,
} from "../actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ColorSelect } from "@/components/admin/ColorSelect";
import { getColorHex } from "@/lib/colors";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);
  const deleteWithId = deleteProduct.bind(null, product.id);

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          {product.name}
        </h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="text-sm text-danger underline"
          >
            Delete
          </button>
        </form>
      </div>

      <form
        action={updateWithId}
        className="max-w-2xl space-y-5 border border-[#d0d0d0] bg-white p-6"
      >
        <Field label="Name" name="name" defaultValue={product.name} required />
        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className="input"
            defaultValue={product.description}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Sell price (GHS)"
            name="price"
            type="number"
            step="0.01"
            defaultValue={String(product.price)}
            required
          />
          <Field
            label="Cost price (GHS)"
            name="costPrice"
            type="number"
            step="0.01"
            defaultValue={String(product.costPrice ?? 0)}
          />
        </div>
        <p className="-mt-2 text-xs text-[#6f6f6f]">
          Cost = money you spent per piece. Used on the Inventory page for profit.
        </p>
        <div>
          <label className="label" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            className="input"
            defaultValue={product.categoryId ?? ""}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="availability">
            Availability
          </label>
          <select
            id="availability"
            name="availability"
            className="input"
            defaultValue={product.availability}
          >
            <option value="AVAILABLE">Available</option>
            <option value="IN_STOCK">Ready to ship</option>
            <option value="PREORDER">Pre-order</option>
          </select>
        </div>
        <Field
          label="Pre-order ETA"
          name="preorderEta"
          defaultValue={product.preorderEta ?? ""}
        />
        <ImageUploader defaultUrls={product.images.map((i) => i.url)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product.featured} />{" "}
          Featured on home
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={product.published}
          />{" "}
          Published
        </label>
        <button type="submit" className="admin-btn">
          Save changes
        </button>
      </form>

      <section className="border border-[#d0d0d0] bg-white p-6">
        <h2 className="text-sm uppercase tracking-[0.16em] text-[#6f6f6f]">
          Colours & sizes
        </h2>
        <ul className="mt-4 space-y-3">
          {product.variants.map((variant) => {
            const hex = getColorHex(variant.color);
            return (
              <li
                key={variant.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee7dc] pb-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  {hex && (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/15"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                  )}
                  {variant.color} · {variant.size}
                </span>
                <form
                  action={updateVariantStock}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="variantId" value={variant.id} />
                  <input
                    name="stock"
                    type="number"
                    defaultValue={variant.stock}
                    className="input w-24"
                  />
                  <button type="submit" className="underline">
                    Update stock
                  </button>
                </form>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 space-y-6 border-t border-[#eee7dc] pt-6">
          <div>
            <h3 className="text-xs uppercase tracking-[0.14em] text-[#6f6f6f]">
              Add a colour (all sizes)
            </h3>
            <form
              action={addColorToProduct}
              className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem_auto]"
            >
              <input type="hidden" name="productId" value={product.id} />
              <ColorSelect defaultValue="Black" />
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                className="input"
                defaultValue={0}
              />
              <button type="submit" className="admin-btn px-3 py-2">
                Add colour
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.14em] text-[#6f6f6f]">
              Add one size / colour variant
            </h3>
            <form
              action={addVariant}
              className="mt-3 grid gap-3 sm:grid-cols-4"
            >
              <input type="hidden" name="productId" value={product.id} />
              <input name="size" placeholder="Size" className="input" required />
              <ColorSelect defaultValue="Black" />
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                className="input"
                defaultValue={0}
              />
              <button type="submit" className="admin-btn px-3 py-2">
                Add variant
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={props.name}>
        {props.label}
      </label>
      <input
        id={props.name}
        name={props.name}
        type={props.type || "text"}
        required={props.required}
        defaultValue={props.defaultValue}
        step={props.step}
        className="input"
      />
    </div>
  );
}
