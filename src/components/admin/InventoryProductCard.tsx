import Link from "next/link";
import { formatGhs } from "@/lib/utils";
import { marginPercent } from "@/lib/inventory";
import { saveInventoryProduct } from "@/app/admin/inventory/actions";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

type Props = {
  productId: string;
  name: string;
  categoryName?: string | null;
  imageUrl?: string | null;
  costPrice: number;
  sellPrice: number;
  isPreorder: boolean;
  variants: Variant[];
  needsCost?: boolean;
  justSaved?: boolean;
};

export function InventoryProductCard({
  productId,
  name,
  categoryName,
  imageUrl,
  costPrice,
  sellPrice,
  isPreorder,
  variants,
  needsCost = false,
  justSaved = false,
}: Props) {
  const stock = variants.reduce((sum, v) => sum + v.stock, 0);
  const profitEach = Math.max(0, sellPrice - costPrice);
  const moneyIn = isPreorder ? 0 : stock * costPrice;
  const ifSoldAll = isPreorder ? 0 : stock * sellPrice;
  const profitAll = ifSoldAll - moneyIn;
  const margin = marginPercent(sellPrice, costPrice);

  const byColor = new Map<string, Variant[]>();
  for (const v of variants) {
    const list = byColor.get(v.color) ?? [];
    list.push(v);
    byColor.set(v.color, list);
  }

  return (
    <div className="space-y-3">
      <form
        id={`inv-${productId}`}
        action={saveInventoryProduct}
        className={`admin-panel overflow-hidden ${
          needsCost ? "border-[#d7b1b7]" : ""
        }`}
      >
        <input type="hidden" name="productId" value={productId} />

        <div className="space-y-5 p-5 md:p-6">
          <div className="flex gap-4">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f0e4e7]">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[0.55rem] text-[#9a7a80]">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                {name}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6f6f6f]">
                {categoryName ?? "Uncategorized"}
                {isPreorder ? " · Pre-order" : ` · ${stock} pieces now`}
              </p>
              <Link
                href={`/admin/products/${productId}`}
                className="mt-1 inline-block text-[0.65rem] uppercase tracking-[0.12em] text-[#6b3f48] underline"
              >
                Full product page
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block rounded-xl bg-[#f8f2f3] p-3">
              <span className="label !mb-1 !text-[#6b3f48]">
                What you paid (cost)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6f6f6f]">GH₵</span>
                <input
                  name="costPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={String(costPrice)}
                  className="input !border-[#d7b1b7] !bg-white !py-2 text-base font-semibold"
                />
              </div>
            </label>

            <label className="block rounded-xl bg-[#f8f2f3] p-3">
              <span className="label !mb-1">Sell price</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6f6f6f]">GH₵</span>
                <input
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  defaultValue={String(sellPrice)}
                  className="input !bg-white !py-2 text-base font-semibold"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#d0d0d0] px-3 py-3">
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#6f6f6f]">
                Profit on 1 piece
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#3d5a45]">
                {formatGhs(profitEach)}
              </p>
              <p className="mt-1 text-[0.65rem] text-[#6f6f6f]">
                {costPrice > 0
                  ? `${margin.toFixed(0)}% margin`
                  : "Add cost to see real profit"}
              </p>
            </div>
            <div className="rounded-xl border border-[#d0d0d0] px-3 py-3">
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#6f6f6f]">
                If all stock sells
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#3d5a45]">
                {isPreorder ? "—" : formatGhs(profitAll)}
              </p>
              <p className="mt-1 text-[0.65rem] text-[#6f6f6f]">
                {isPreorder
                  ? "Pre-order item"
                  : `In: ${formatGhs(moneyIn)} · Out: ${formatGhs(ifSoldAll)}`}
              </p>
            </div>
          </div>

          {!isPreorder && (
            <div>
              <p className="label">Pieces available (change numbers, then save)</p>
              {variants.length === 0 ? (
                <p className="mt-2 text-sm text-[#6f6f6f]">
                  No sizes yet.{" "}
                  <Link
                    href={`/admin/products/${productId}`}
                    className="underline"
                  >
                    Add sizes on the product page
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {[...byColor.entries()].map(([color, colorVariants]) => (
                    <div
                      key={color}
                      className="rounded-xl border border-[#e8d5d8] bg-[#fdfbfb] p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b3f48]">
                        {color}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {colorVariants.map((v) => (
                          <label
                            key={v.id}
                            className="flex items-center gap-2 rounded-lg border border-[#d0d0d0] bg-white px-2.5 py-2"
                          >
                            <span className="min-w-8 text-xs font-semibold uppercase tracking-[0.1em]">
                              {v.size}
                            </span>
                            <input
                              name={`stock_${v.id}`}
                              type="number"
                              min={0}
                              step={1}
                              defaultValue={String(v.stock)}
                              className="w-16 border border-[#d0d0d0] px-2 py-1 text-center text-sm font-semibold outline-none focus:border-[#d7b1b7]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[#eee] pt-4">
            <button type="submit" className="admin-btn">
              Save changes
            </button>
            <p className="text-xs text-[#6f6f6f]">
              Paid {formatGhs(costPrice)} → sell {formatGhs(sellPrice)} → keep{" "}
              {formatGhs(profitEach)}
            </p>
          </div>
        </div>
      </form>

      {/* Confirmation sits under the product, not at the page top */}
      {justSaved && (
        <div className="rounded-xl border border-[#3d5a45]/30 bg-[#3d5a45]/10 px-4 py-3 text-sm text-success">
          Saved for <strong>{name}</strong>. Stock is now{" "}
          <strong>{stock}</strong> piece{stock === 1 ? "" : "s"}
          {costPrice > 0 ? (
            <>
              {" "}
              · money in this style: <strong>{formatGhs(moneyIn)}</strong>
            </>
          ) : null}
          .
        </div>
      )}
    </div>
  );
}
