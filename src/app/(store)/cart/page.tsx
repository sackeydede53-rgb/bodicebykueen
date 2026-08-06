"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatGhs } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-24 md:px-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-ivory">
        Your cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-12">
          <p className="text-stone">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-8 inline-flex">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-8">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex flex-col gap-4 border-b border-champagne/15 pb-8 sm:flex-row"
            >
              <div className="h-36 w-28 shrink-0 bg-ink-soft">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-[family-name:var(--font-display)] text-2xl text-ivory"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-stone">
                      {item.color} · {item.size}
                      {item.isPreorder ? " · Pre-order" : ""}
                    </p>
                    {item.isPreorder && item.preorderEta && (
                      <p className="mt-1 text-xs text-champagne/70">
                        Est. {item.preorderEta}
                      </p>
                    )}
                  </div>
                  <p className="text-champagne">
                    {formatGhs(item.unitPrice * item.quantity)}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.variantId,
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                    className="input w-20"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="text-[0.7rem] uppercase tracking-[0.16em] text-stone hover:text-ivory"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col items-stretch gap-3 pt-4 sm:items-end">
            <p className="text-lg text-ivory">
              Subtotal{" "}
              <span className="text-champagne">{formatGhs(subtotal)}</span>
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/shop" className="btn-ghost w-full sm:w-auto">
                Continue shopping
              </Link>
              <Link href="/checkout" className="btn-primary w-full sm:w-auto">
                Proceed to payment
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
