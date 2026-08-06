import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  expenseCategoryLabel,
  marginPercent,
  stockHealth,
} from "@/lib/inventory";
import {
  addInventoryExpense,
  deleteInventoryExpense,
  quickUpdateStock,
  updateProductCost,
} from "./actions";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

type Props = {
  searchParams: Promise<{ ok?: string; error?: string }>;
};

export default async function InventoryPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const [products, expenses, paidOrders] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryExpense.findMany({
      orderBy: { spentAt: "desc" },
      take: 40,
    }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] } },
      include: { items: true },
    }),
  ]);

  let unitsInStock = 0;
  let inventoryCost = 0;
  let inventoryRetail = 0;
  let missingCostCount = 0;

  const rows = products.map((product) => {
    const isPreorder = product.availability === "PREORDER";
    const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    const cost = product.costPrice || 0;
    const sell = product.price || 0;
    const costValue = isPreorder ? 0 : stock * cost;
    const retailValue = isPreorder ? 0 : stock * sell;
    const potential = retailValue - costValue;
    const margin = marginPercent(sell, cost);
    const health = stockHealth(stock, isPreorder);

    if (!isPreorder) {
      unitsInStock += stock;
      inventoryCost += costValue;
      inventoryRetail += retailValue;
      if (cost <= 0 && stock > 0) missingCostCount += 1;
    }

    return {
      product,
      stock,
      cost,
      sell,
      costValue,
      retailValue,
      potential,
      margin,
      health,
      isPreorder,
    };
  });

  const potentialProfit = inventoryRetail - inventoryCost;

  let soldUnits = 0;
  let salesRevenue = 0;
  let salesCogs = 0;
  for (const order of paidOrders) {
    salesRevenue += order.total;
    for (const item of order.items) {
      soldUnits += item.quantity;
      salesCogs += (item.unitCost || 0) * item.quantity;
    }
  }
  const realizedGross = salesRevenue - salesCogs;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netAfterExpenses = realizedGross - totalExpenses;
  const avgMargin =
    rows.filter((r) => !r.isPreorder && r.sell > 0).length > 0
      ? rows
          .filter((r) => !r.isPreorder && r.sell > 0)
          .reduce((sum, r) => sum + r.margin, 0) /
        rows.filter((r) => !r.isPreorder && r.sell > 0).length
      : 0;

  const topPotential = [...rows]
    .filter((r) => !r.isPreorder && r.potential > 0)
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 5);

  const lowStock = rows
    .filter((r) => r.health === "low" || r.health === "out")
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#6f6f6f]">
            Atelier ledger
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[0.02em]">
            Inventory
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#6f6f6f]">
            Track money tied up in stock, profit waiting on the rack, and cash
            spent on goods.
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn">
          Add product
        </Link>
      </div>

      {params.ok === "expense" && (
        <p className="border border-[#3d5a45]/25 bg-[#3d5a45]/10 px-4 py-3 text-sm text-success">
          Expense logged.
        </p>
      )}
      {params.error === "expense" && (
        <p className="border border-[#c46b6b]/40 bg-[#c46b6b]/10 px-4 py-3 text-sm text-danger">
          Enter a title and amount for the expense.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Money in stock"
          value={formatGhs(inventoryCost)}
          hint={`${unitsInStock} units at cost`}
        />
        <Stat
          label="Retail value"
          value={formatGhs(inventoryRetail)}
          hint="If everything sells at list price"
        />
        <Stat
          label="Profit to be made"
          value={formatGhs(potentialProfit)}
          hint={`Avg margin ${avgMargin.toFixed(0)}%`}
          accent
        />
        <Stat
          label="Net after expenses"
          value={formatGhs(netAfterExpenses)}
          hint={`${formatGhs(realizedGross)} sales profit − ${formatGhs(totalExpenses)} spent`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Sales revenue (paid)"
          value={formatGhs(salesRevenue)}
          hint={`${soldUnits} units sold`}
        />
        <Stat
          label="Cost of goods sold"
          value={formatGhs(salesCogs)}
          hint="From cost snapshots on orders"
        />
        <Stat
          label="Expenses logged"
          value={formatGhs(totalExpenses)}
          hint={`${expenses.length} entries`}
        />
      </div>

      {missingCostCount > 0 && (
        <p className="border border-[#d7b1b7] bg-[#f8f2f3] px-4 py-3 text-sm text-[#6b3f48]">
          {missingCostCount} in-stock product
          {missingCostCount === 1 ? "" : "s"} still have cost set to GH₵0.
          Add costs below so profit figures stay accurate.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-panel p-6">
          <h2 className="text-[0.68rem] uppercase tracking-[0.18em] text-[#6f6f6f]">
            Biggest profit sitting in stock
          </h2>
          <ul className="mt-5 divide-y divide-black/[0.05]">
            {topPotential.length === 0 && (
              <li className="py-3 text-sm text-[#6f6f6f]">
                Add cost prices to see potential profit.
              </li>
            )}
            {topPotential.map((row) => (
              <li
                key={row.product.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/products/${row.product.id}`}
                    className="font-medium hover:underline"
                  >
                    {row.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-[#6f6f6f]">
                    {row.stock} units · {row.margin.toFixed(0)}% margin
                  </p>
                </div>
                <p className="font-medium text-[#3d5a45]">
                  {formatGhs(row.potential)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel p-6">
          <h2 className="text-[0.68rem] uppercase tracking-[0.18em] text-[#6f6f6f]">
            Stock attention
          </h2>
          <ul className="mt-5 divide-y divide-black/[0.05]">
            {lowStock.length === 0 && (
              <li className="py-3 text-sm text-[#6f6f6f]">
                No low or empty stock right now.
              </li>
            )}
            {lowStock.map((row) => (
              <li
                key={row.product.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/products/${row.product.id}`}
                    className="font-medium hover:underline"
                  >
                    {row.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-[#6f6f6f]">
                    Cost tied up: {formatGhs(row.costValue)}
                  </p>
                </div>
                <HealthBadge health={row.health} stock={row.stock} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="admin-panel overflow-hidden">
        <div className="border-b border-[#d0d0d0] px-6 py-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Stock & margins
          </h2>
          <p className="mt-1 text-sm text-[#6f6f6f]">
            Set cost per piece, then watch profit-to-be-made update live.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8f2f3] text-[0.62rem] uppercase tracking-[0.14em] text-[#6f6f6f]">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Cost / unit</th>
                <th className="px-4 py-3 font-medium">Sell</th>
                <th className="px-4 py-3 font-medium">Margin</th>
                <th className="px-4 py-3 font-medium">Money in</th>
                <th className="px-4 py-3 font-medium">Profit ahead</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.map((row) => (
                <tr key={row.product.id} className="align-top">
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/products/${row.product.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#6f6f6f]">
                      {row.product.category?.name ?? "Uncategorized"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {row.isPreorder ? (
                      <span className="text-[#6f6f6f]">Pre-order</span>
                    ) : (
                      <div className="space-y-2">
                        <p>{row.stock} units</p>
                        <div className="space-y-1">
                          {row.product.variants.slice(0, 6).map((v) => (
                            <form
                              key={v.id}
                              action={quickUpdateStock}
                              className="flex items-center gap-1"
                            >
                              <input type="hidden" name="variantId" value={v.id} />
                              <span className="w-16 truncate text-[0.65rem] text-[#6f6f6f]">
                                {v.size}/{v.color}
                              </span>
                              <input
                                name="stock"
                                type="number"
                                min={0}
                                defaultValue={v.stock}
                                className="input !w-14 !px-1 !py-1 text-xs"
                              />
                              <button
                                type="submit"
                                className="text-[0.58rem] uppercase tracking-[0.1em] text-[#6b3f48] underline"
                              >
                                Set
                              </button>
                            </form>
                          ))}
                          {row.product.variants.length > 6 && (
                            <p className="text-[0.65rem] text-[#6f6f6f]">
                              +{row.product.variants.length - 6} more on product
                              page
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <form action={updateProductCost} className="flex items-center gap-1">
                      <input
                        type="hidden"
                        name="productId"
                        value={row.product.id}
                      />
                      <input
                        name="costPrice"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={String(row.cost)}
                        className="input !w-24 !px-2 !py-1 text-xs"
                      />
                      <button
                        type="submit"
                        className="text-[0.58rem] uppercase tracking-[0.1em] text-[#6b3f48] underline"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-4">{formatGhs(row.sell)}</td>
                  <td className="px-4 py-4">
                    {row.isPreorder ? "—" : `${row.margin.toFixed(0)}%`}
                  </td>
                  <td className="px-4 py-4">
                    {row.isPreorder ? "—" : formatGhs(row.costValue)}
                  </td>
                  <td className="px-4 py-4 font-medium text-[#3d5a45]">
                    {row.isPreorder ? "—" : formatGhs(row.potential)}
                  </td>
                  <td className="px-4 py-4">
                    <HealthBadge health={row.health} stock={row.stock} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#6f6f6f]">
                    No products yet.{" "}
                    <Link href="/admin/products/new" className="underline">
                      Add your first piece
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form action={addInventoryExpense} className="admin-panel space-y-4 p-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              Log money spent
            </h2>
            <p className="mt-1 text-sm text-[#6f6f6f]">
              Fabric runs, packaging, supplier trips — anything that bought the
              goods.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="title">
              What did you buy?
            </label>
            <input
              id="title"
              name="title"
              required
              className="input"
              placeholder="e.g. Stretch fabric — Kejetia"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="amount">
                Amount (GHS)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min={0}
                step="0.01"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select id="category" name="category" className="input" defaultValue="FABRIC">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="spentAt">
              Date spent
            </label>
            <input
              id="spentAt"
              name="spentAt"
              type="date"
              className="input"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div>
            <label className="label" htmlFor="note">
              Note (optional)
            </label>
            <input id="note" name="note" className="input" placeholder="Vendor, colours, etc." />
          </div>
          <button type="submit" className="admin-btn">
            Add expense
          </button>
        </form>

        <div className="admin-panel p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Expense log
          </h2>
          <ul className="mt-5 divide-y divide-black/[0.05]">
            {expenses.length === 0 && (
              <li className="py-3 text-sm text-[#6f6f6f]">
                No expenses logged yet.
              </li>
            )}
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-start justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="mt-0.5 text-xs text-[#6f6f6f]">
                    {expenseCategoryLabel(expense.category)} ·{" "}
                    {expense.spentAt.toLocaleDateString("en-GB")}
                    {expense.note ? ` · ${expense.note}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatGhs(expense.amount)}</p>
                  <form action={deleteInventoryExpense} className="mt-1">
                    <input type="hidden" name="id" value={expense.id} />
                    <button
                      type="submit"
                      className="text-[0.6rem] uppercase tracking-[0.12em] text-danger underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`admin-panel p-6 ${accent ? "border-[#d7b1b7] bg-[#f8f2f3]" : ""}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#6f6f6f]">
        {label}
      </p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-wide md:text-4xl">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-[#6f6f6f]">{hint}</p>}
    </div>
  );
}

function HealthBadge({
  health,
  stock,
}: {
  health: "preorder" | "out" | "low" | "ok";
  stock: number;
}) {
  if (health === "preorder") {
    return <span className="admin-badge admin-badge-soft">Pre-order</span>;
  }
  if (health === "out") {
    return <span className="admin-badge admin-badge-ink">Out of stock</span>;
  }
  if (health === "low") {
    return (
      <span className="admin-badge admin-badge-champagne">{stock} left</span>
    );
  }
  return (
    <span className="admin-badge admin-badge-success">{stock} in stock</span>
  );
}
