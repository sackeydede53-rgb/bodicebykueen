import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";
import { verifyTransaction } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ order?: string; reference?: string; trxref?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const reference = params.reference || params.trxref;
  let orderNumber = params.order;

  if (reference) {
    try {
      const verified = await verifyTransaction(reference);
      const payment = await prisma.payment.findUnique({
        where: { paystackReference: reference },
        include: { order: true },
      });
      if (payment && verified.status === "success") {
        await markOrderPaid(payment.orderId, {
          channel: verified.channel,
          rawResponse: JSON.stringify(verified),
          paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
        });
        orderNumber = payment.order.orderNumber;
      } else if (payment) {
        orderNumber = payment.order.orderNumber;
      }
    } catch {
      // show order if we can still resolve it
      const payment = await prisma.payment.findUnique({
        where: { paystackReference: reference },
        include: { order: true },
      });
      if (payment) orderNumber = payment.order.orderNumber;
    }
  }

  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, payment: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-24 md:px-10">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-champagne">
        {order?.status === "PAID" || order?.status === "PROCESSING"
          ? "Payment received"
          : "Order received"}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory">
        Thank you
      </h1>

      {!order ? (
        <p className="mt-8 text-stone">
          We could not find that order. If you completed payment, please contact
          us with your Paystack reference.
        </p>
      ) : (
        <div className="mt-10 space-y-6 text-sm">
          <p className="text-ivory/80">
            Order <span className="text-champagne">{order.orderNumber}</span> for{" "}
            {order.customerName}
          </p>
          <p className="text-stone">
            Status: {order.status.replace("_", " ")} · Total{" "}
            {formatGhs(order.total)}
          </p>
          {order.hasPreorder && (
            <p className="border border-champagne/25 bg-ink-soft/50 p-4 text-champagne">
              This order includes pre-order pieces. Those items will ship when
              ready.
            </p>
          )}
          <ul className="space-y-3 border-t border-champagne/15 pt-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.productName} · {item.size}/{item.color} × {item.quantity}
                  {item.isPreorder ? " (pre-order)" : ""}
                </span>
                <span className="text-champagne">
                  {formatGhs(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-stone">
            A confirmation has been sent to {order.customerEmail}.
          </p>
        </div>
      )}

      <Link href="/shop" className="btn-primary mt-10 inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
