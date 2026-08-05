"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatGhs } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = Math.max(0, subtotal - discount);

  async function applyPromo() {
    setPromoMessage("");
    if (!promoCode.trim()) return;
    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDiscount(0);
      setPromoMessage(data.error || "Invalid code");
      return;
    }
    setDiscount(data.discountAmount);
    setPromoMessage(`Applied: −${formatGhs(data.discountAmount)}`);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") || ""),
      customerEmail: String(form.get("customerEmail") || ""),
      customerPhone: String(form.get("customerPhone") || ""),
      addressLine1: String(form.get("addressLine1") || ""),
      addressLine2: String(form.get("addressLine2") || ""),
      city: String(form.get("city") || ""),
      region: String(form.get("region") || ""),
      notes: String(form.get("notes") || ""),
      promoCode: promoCode || undefined,
      items: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      clearCart();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      window.location.href = `/order/confirmation?order=${data.orderNumber}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 pb-24 pt-24">
        <h1 className="font-[family-name:var(--font-display)] text-5xl text-ivory">
          Checkout
        </h1>
        <p className="mt-6 text-stone">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Shop collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-24 lg:grid-cols-[1.2fr_0.8fr] md:px-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-5xl text-ivory">
          Checkout
        </h1>
        <p className="mt-3 text-sm text-stone">
          Guest checkout · Pay with Mobile Money (Paystack)
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <label className="label" htmlFor="customerName">
              Full name
            </label>
            <input id="customerName" name="customerName" required className="input" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="customerEmail">
                Email
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="customerPhone">
                Phone (MoMo)
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                required
                placeholder="024XXXXXXX"
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="addressLine1">
              Delivery address
            </label>
            <input id="addressLine1" name="addressLine1" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="addressLine2">
              Address line 2
            </label>
            <input id="addressLine2" name="addressLine2" className="input" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="city">
                City
              </label>
              <input id="city" name="city" required className="input" defaultValue="Kumasi" />
            </div>
            <div>
              <label className="label" htmlFor="region">
                Region
              </label>
              <input id="region" name="region" className="input" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="notes">
              Order notes
            </label>
            <textarea id="notes" name="notes" rows={3} className="input" />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Redirecting to Paystack…" : `Pay ${formatGhs(total)} with MoMo`}
          </button>
        </form>
      </div>

      <aside className="border border-champagne/15 bg-ink-soft/40 p-6 h-fit">
        <h2 className="text-[0.7rem] uppercase tracking-[0.22em] text-champagne">
          Order summary
        </h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between gap-4 text-sm">
              <span className="text-ivory/85">
                {item.productName} × {item.quantity}
                {item.isPreorder ? " (pre-order)" : ""}
              </span>
              <span className="text-champagne">
                {formatGhs(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          <label className="label" htmlFor="promo">
            Promo code
          </label>
          <div className="flex gap-2">
            <input
              id="promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="input"
            />
            <button type="button" onClick={applyPromo} className="btn-ghost shrink-0 px-4">
              Apply
            </button>
          </div>
          {promoMessage && (
            <p className="text-xs text-champagne">{promoMessage}</p>
          )}
        </div>

        <div className="mt-8 space-y-2 border-t border-champagne/15 pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-stone">Subtotal</span>
            <span>{formatGhs(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-champagne">
              <span>Discount</span>
              <span>−{formatGhs(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg text-ivory">
            <span>Total</span>
            <span className="text-champagne">{formatGhs(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
