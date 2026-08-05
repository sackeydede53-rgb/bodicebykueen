import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [orderCount, productCount, recentOrders, preorderOrders, lowStock] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.order.count({
        where: { hasPreorder: true, status: { in: ["PAID", "PROCESSING"] } },
      }),
      prisma.productVariant.findMany({
        where: {
          stock: { lte: 2 },
          product: {
            is: {
              availability: { not: "PREORDER" },
            },
          },
        },
        include: { product: true },
        take: 8,
      }),
    ]);

  return (
    <div>
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#8a8174]">
          Overview
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[0.02em]">
          Dashboard
        </h1>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(orderCount)} />
        <Stat label="Products" value={String(productCount)} />
        <Stat label="Open pre-orders" value={String(preorderOrders)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="admin-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[0.68rem] uppercase tracking-[0.18em] text-[#8a8174]">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-[0.65rem] uppercase tracking-[0.16em] text-ink/60 hover:text-ink"
            >
              View all →
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-black/[0.05]">
            {recentOrders.length === 0 && (
              <li className="py-3 text-sm text-[#8a8174]">No orders yet.</li>
            )}
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-[#8a8174]">
                    {order.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p>{formatGhs(order.total)}</p>
                  <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-[#8a8174]">
                    {order.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel p-6">
          <h2 className="text-[0.68rem] uppercase tracking-[0.18em] text-[#8a8174]">
            Low stock
          </h2>
          <ul className="mt-5 divide-y divide-black/[0.05]">
            {lowStock.length === 0 && (
              <li className="py-3 text-sm text-[#8a8174]">Stock looks healthy.</li>
            )}
            {lowStock.map((v) => (
              <li key={v.id} className="flex justify-between gap-3 py-3 text-sm">
                <span>
                  {v.product.name}
                  <span className="text-[#8a8174]">
                    {" "}
                    · {v.size}/{v.color}
                  </span>
                </span>
                <span className="admin-badge admin-badge-champagne">
                  {v.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-panel p-6">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#8a8174]">
        {label}
      </p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide">
        {value}
      </p>
    </div>
  );
}
