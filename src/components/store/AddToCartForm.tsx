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
  const [color, setColor] = useState(colors[0] ?? "Black");
  const sizesForColor = variants.filter((v) => v.color === color);
  const [size, setSize] = useState(sizesForColor[0]?.size ?? "");
  const [added, setAdded] = useState(false);

  const selected =
    variants.find((v) => v.color === color && v.size === size) ??
    sizesForColor[0];

  const canPurchase = !!selected && (isPreorder || selected.stock > 0);

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

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <p className="label">Colour</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const hex = getColorHex(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    const next = variants.find((v) => v.color === c);
                    if (next) setSize(next.size);
                    setAdded(false);
                  }}
                  className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] ${
                    color === c
                      ? "border-champagne bg-champagne text-[var(--on-accent)]"
                      : "border-champagne/30 text-champagne"
                  }`}
                >
                  {hex && (
                    <span
                      className="h-3 w-3 rounded-full border border-white/30"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                  )}
                  {c}
                </button>
              );
            })}
          </div>
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
                className={`min-w-12 border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] disabled:opacity-30 ${
                  size === v.size
                    ? "border-champagne bg-champagne text-[var(--on-accent)]"
                    : "border-champagne/30 text-champagne"
                }`}
              >
                {v.size}
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
          {isPreorder ? "Pre-order" : "Add to cart"}
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

      {!canPurchase && (
        <p className="text-center text-sm text-stone">Currently unavailable</p>
      )}
    </div>
  );
}
