import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ColorOptions } from "@/components/admin/ColorOptions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        New product
      </h1>
      <form action={createProduct} className="mt-8 space-y-5 border border-[#d8d0c4] bg-white p-6">
        <Field label="Name" name="name" required />
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
          />
        </div>
        <Field label="Price (GHS)" name="price" type="number" step="0.01" required />
        <div>
          <label className="label" htmlFor="categoryId">
            Category
          </label>
          <select id="categoryId" name="categoryId" className="input">
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
          <select id="availability" name="availability" className="input" defaultValue="AVAILABLE">
            <option value="AVAILABLE">Available</option>
            <option value="IN_STOCK">Ready to ship</option>
            <option value="PREORDER">Pre-order</option>
          </select>
        </div>
        <Field label="Pre-order ETA" name="preorderEta" placeholder="e.g. Ships mid-September" />
        <Field label="Sizes (comma-separated)" name="sizes" defaultValue="XS,S,M,L,XL" />
        <ColorOptions defaultColors={["Black", "White"]} />
        <Field label="Initial stock per colour × size" name="stock" type="number" defaultValue="5" />
        <ImageUploader />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> Featured on home
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        <button type="submit" className="admin-btn">
          Create product
        </button>
      </form>
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
  placeholder?: string;
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
        placeholder={props.placeholder}
        className="input"
      />
    </div>
  );
}
