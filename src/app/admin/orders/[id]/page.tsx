import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";
import { updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          {order.orderNumber}
        </h1>
        <p className="mt-2 text-sm text-[#6f6f6f]">
          {order.createdAt.toLocaleString()} · {order.status}
          {order.hasPreorder ? " · includes pre-order" : ""}
        </p>
      </div>

      <section className="border border-[#d0d0d0] bg-white p-6 text-sm">
        <h2 className="text-xs uppercase tracking-[0.16em] text-[#6f6f6f]">
          Customer
        </h2>
        <div className="mt-3 space-y-1">
          <p>{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>MoMo: {order.customerPhone}</p>
          {order.addressLine2 && <p>Call: {order.addressLine2}</p>}
          <p>{order.addressLine1}</p>
          <p>
            {order.city}
            {order.region ? `, ${order.region}` : ""}
          </p>
          {order.notes && <p className="pt-2 text-[#6f6f6f]">Notes: {order.notes}</p>}
        </div>
      </section>

      <section className="border border-[#d0d0d0] bg-white p-6">
        <h2 className="text-xs uppercase tracking-[0.16em] text-[#6f6f6f]">
          Items
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.productName} · {item.size}/{item.color} × {item.quantity}
                {item.isPreorder
                  ? ` (pre-order${item.preorderEta ? `: ${item.preorderEta}` : ""})`
                  : ""}
              </span>
              <span>{formatGhs(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-1 border-t border-[#eee7dc] pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatGhs(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Discount ({order.promoCodeUsed})</span>
              <span>−{formatGhs(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatGhs(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="border border-[#d0d0d0] bg-white p-6 text-sm">
        <h2 className="text-xs uppercase tracking-[0.16em] text-[#6f6f6f]">
          Payment
        </h2>
        {order.payment ? (
          <div className="mt-3 space-y-1">
            <p>Status: {order.payment.status}</p>
            <p>Reference: {order.payment.paystackReference}</p>
            <p>Channel: {order.payment.channel || "—"}</p>
            <p>Amount: {formatGhs(order.payment.amount)}</p>
          </div>
        ) : (
          <p className="mt-3">No payment record</p>
        )}
      </section>

      <form
        action={updateOrderStatus}
        className="flex flex-wrap items-end gap-3 border border-[#d0d0d0] bg-white p-6"
      >
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label className="label" htmlFor="status">
            Fulfillment status
          </label>
          <select
            id="status"
            name="status"
            className="input"
            defaultValue={order.status}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="admin-btn">
          Update status
        </button>
      </form>
    </div>
  );
}
