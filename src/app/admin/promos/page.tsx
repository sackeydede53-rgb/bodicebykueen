import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createPromo, togglePromo } from "./actions";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  await requireAdmin();
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Promo codes
      </h1>

      <form
        action={createPromo}
        className="mt-8 grid max-w-xl gap-3 border border-[#d0d0d0] bg-white p-6 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="label" htmlFor="code">
            Code
          </label>
          <input id="code" name="code" required className="input" placeholder="KUEEN10" />
        </div>
        <div>
          <label className="label" htmlFor="discountType">
            Type
          </label>
          <select id="discountType" name="discountType" className="input">
            <option value="PERCENT">Percent</option>
            <option value="FIXED">Fixed (GHS)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="discountValue">
            Value
          </label>
          <input
            id="discountValue"
            name="discountValue"
            type="number"
            step="0.01"
            required
            className="input"
          />
        </div>
        <button type="submit" className="admin-btn sm:col-span-2">
          Create promo
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {promos.map((promo) => (
          <li
            key={promo.id}
            className="flex items-center justify-between gap-4 border border-[#d0d0d0] bg-white px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{promo.code}</p>
              <p className="text-[#6f6f6f]">
                {promo.discountType === "PERCENT"
                  ? `${promo.discountValue}%`
                  : `GHS ${promo.discountValue}`}{" "}
                · {promo.active ? "Active" : "Inactive"}
              </p>
            </div>
            <form action={togglePromo}>
              <input type="hidden" name="id" value={promo.id} />
              <input type="hidden" name="active" value={String(promo.active)} />
              <button type="submit" className="underline">
                {promo.active ? "Disable" : "Enable"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
