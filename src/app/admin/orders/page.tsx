import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ preorder?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const orders = await prisma.order.findMany({
    where: params.preorder === "1" ? { hasPreorder: true } : undefined,
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Orders
        </h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/orders" className="underline">
            All
          </Link>
          <Link href="/admin/orders?preorder=1" className="underline">
            Pre-order only
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto border border-[#d0d0d0] bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[#d0d0d0] text-xs uppercase tracking-[0.12em] text-[#6f6f6f]">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#eee7dc]">
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="underline">
                    {order.orderNumber}
                  </Link>
                  <div className="text-xs text-[#6f6f6f]">
                    {order.createdAt.toLocaleString()}
                  </div>
                </td>
                <td className="p-3">
                  {order.customerName}
                  <div className="text-xs text-[#6f6f6f]">
                    {order.customerPhone}
                  </div>
                </td>
                <td className="p-3">{formatGhs(order.total)}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">
                  {order.payment?.status ?? "—"}
                  {order.payment?.channel
                    ? ` · ${order.payment.channel}`
                    : ""}
                </td>
                <td className="p-3">
                  {order.hasPreorder ? "Pre-order" : "In stock"}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-[#6f6f6f]">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
