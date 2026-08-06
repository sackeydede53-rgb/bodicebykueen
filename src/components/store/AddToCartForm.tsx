"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { getColorHex } from "@/lib/colors";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

type Props = {
  productId: string;
  productName: string;
  slug: string;
  unitPrice: number;
  imageUrl?: string;
  isPreorder: boolean;
  preorderEta?: string | null;
  variants: Variant[];
};

export function AddToCartForm({
  productId,
  productName,
  slug,
  unitPrice,
  imageUrl,
  isPreorder,
  preorderEta,
  variants,
}: Props) {
  const { addItem } = useCart();
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants],
  );

  const colourStock = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of variants) {
      map.set(v.color, (map.get(v.color) ?? 0) + v.stock);
    }
    return map;
  }, [variants]);

  const productOutOfStock =
    !isPreorder &&
    (variants.length === 0 || variants.every((v) => v.stock <= 0));

  const firstAvailableColor =
    colors.find((c) => (colourStock.get(c) ?? 0) > 0) ?? colors[0] ?? "Black";

  const [color, setColor] = useState(firstAvailableColor);
  const sizesForColor = variants.filter((v) => v.color === color);
  const [size, setSize] = useState(
    () =>
      sizesForColor.find((v) => isPreorder || v.stock > 0)?.size ??
      sizesForColor[0]?.size ??
      "",
  );
  const [added, setAdded] = useState(false);

  const selected =
    variants.find((v) => v.color === color && v.size === size) ??
    sizesForColor[0];

  const colorOutOfStock = !isPreorder && (colourStock.get(color) ?? 0) <= 0;
  const canPurchase =
    !productOutOfStock &&
    !!selected &&
    (isPreorder || selected.stock > 0);

  function handleAdd() {
    if (!selected || !canPurchase) return;
    addItem({
      variantId: selected.id,
      productId,
      productName,
      slug,
      size: selected.size,
      color: selected.color,
      unitPrice,
      imageUrl,
      isPreorder,
      preorderEta,
    });
    setAdded(true);
  }

  if (productOutOfStock) {
    return (
      <div className="rounded-2xl border-2 border-[#6b3f48] bg-white px-4 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6b3f48]">
          Out of stock
        </p>
        <p className="mt-2 text-sm text-[#3a3a3a]">
          This piece is currently sold out. Check back soon or browse other
          styles.
        </p>
        <Link href="/shop" className="btn-primary mt-5 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <p className="label">Colour</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const hex = getColorHex(c);
              const soldOut = !isPreorder && (colourStock.get(c) ?? 0) <= 0;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    const nextSizes = variants.filter((v) => v.color === c);
                    const next =
                      nextSizes.find((v) => isPreorder || v.stock > 0) ??
                      nextSizes[0];
                    if (next) setSize(next.size);
                    setAdded(false);
                  }}
                  className={`inline-flex items-center gap-2 border-2 px-3 py-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] ${
                    color === c
                      ? "border-[#6b3f48] bg-[#6b3f48] text-white"
                      : "border-[#6b3f48] bg-white text-[#3a3a3a]"
                  } ${soldOut ? "opacity-55" : ""}`}
                >
                  {hex && (
                    <span
                      className="h-3 w-3 rounded-full border border-white/30"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                  )}
                  {c}
                  {soldOut ? " · Sold out" : ""}
                </button>
              );
            })}
          </div>
          {colorOutOfStock && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b3f48]">
              This colour is out of stock
            </p>
          )}
        </div>
      )}

      <div>
        <p className="label">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((v) => {
            const disabled = !isPreorder && v.stock <= 0;
            return (
              <button
                key={v.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSize(v.size);
                  setAdded(false);
                }}
                className={`min-w-12 border-2 px-3 py-2 text-[0.8rem] font-bold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:bg-[#f0e4e7] disabled:text-[#9a7a80] ${
                  size === v.size && !disabled
                    ? "border-[#6b3f48] bg-[#6b3f48] text-white"
                    : "border-[#6b3f48] bg-white text-[#3a3a3a]"
                }`}
              >
                {v.size}
                {disabled ? (
                  <span className="mt-0.5 block text-[0.55rem] tracking-[0.08em]">
                    Out
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {!added ? (
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canPurchase}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!canPurchase
            ? "Out of stock"
            : isPreorder
              ? "Pre-order"
              : "Add to cart"}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-champagne/25 bg-ink-soft/40 p-4">
          <p className="text-center text-sm text-ivory">Added to cart</p>
          <Link href="/checkout" className="btn-primary w-full">
            Proceed to payment
          </Link>
          <Link href="/shop" className="btn-ghost w-full">
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => setAdded(false)}
            className="w-full text-center text-[0.65rem] uppercase tracking-[0.14em] text-label"
          >
            Add another
          </button>
        </div>
      )}

      {!canPurchase && !colorOutOfStock && (
        <p className="text-center text-sm font-semibold text-[#6b3f48]">
          Selected size is out of stock
        </p>
      )}
    </div>
  );
}
