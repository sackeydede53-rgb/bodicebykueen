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
} from "./actions";
import { InventoryProductCard } from "@/components/admin/InventoryProductCard";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

type Props = {
  searchParams: Promise<{
    ok?: string;
    error?: string;
    focus?: string;
    view?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const view = params.view || "all";

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
    const needsCost = !isPreorder && cost <= 0 && stock > 0;

    if (!isPreorder) {
      unitsInStock += stock;
      inventoryCost += costValue;
      inventoryRetail += retailValue;
      if (needsCost) missingCostCount += 1;
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
      needsCost,
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

  const filtered = rows.filter((row) => {
    if (view === "needs-cost") return row.needsCost;
    if (view === "low") return row.health === "low" || row.health === "out";
    if (view === "ready") return !row.isPreorder && row.stock > 0;
    return true;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#6f6f6f]">
            Your stock book
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[0.02em]">
            Inventory
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6f6f6f]">
            For every piece: enter <strong className="font-semibold text-[#3a3a3a]">what you paid</strong>,
            keep <strong className="font-semibold text-[#3a3a3a]">how many you have</strong>, and see{" "}
            <strong className="font-semibold text-[#3a3a3a]">profit</strong> instantly.
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn">
          Add product
        </Link>
      </div>

      {params.ok === "saved" && (
        <p className="border border-[#3d5a45]/25 bg-[#3d5a45]/10 px-4 py-3 text-sm text-success">
          Saved. Your totals below are updated.
        </p>
      )}
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
      {params.error === "price" && (
        <p className="border border-[#c46b6b]/40 bg-[#c46b6b]/10 px-4 py-3 text-sm text-danger">
          Sell price is required.
        </p>
      )}

      {/* Plain-language money story */}
      <section className="admin-panel p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          In simple words
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          <li className="rounded-2xl bg-[#f8f2f3] p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#6b3f48]">
              1 · Money you put in
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
              {formatGhs(inventoryCost)}
            </p>
            <p className="mt-2 text-sm text-[#6f6f6f]">
              Cost of all {unitsInStock} pieces you currently have. This only
              works after you fill in each product&apos;s cost.
            </p>
          </li>
          <li className="rounded-2xl bg-[#f8f2f3] p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#6b3f48]">
              2 · If customers buy everything
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
              {formatGhs(inventoryRetail)}
            </p>
            <p className="mt-2 text-sm text-[#6f6f6f]">
              Total money you would collect at today&apos;s sell prices.
            </p>
          </li>
          <li className="rounded-2xl border border-[#d7b1b7] bg-white p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#6b3f48]">
              3 · Profit waiting for you
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[#3d5a45]">
              {formatGhs(potentialProfit)}
            </p>
            <p className="mt-2 text-sm text-[#6f6f6f]">
              Step 2 minus step 1. Your earn if every in-stock piece sells.
            </p>
          </li>
        </ol>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MiniStat
            label="Already sold (paid orders)"
            value={formatGhs(salesRevenue)}
            hint={`${soldUnits} pieces · profit so far ${formatGhs(realizedGross)}`}
          />
          <MiniStat
            label="Extra money spent on goods"
            value={formatGhs(totalExpenses)}
            hint="Fabric, packaging, supplier trips (log below)"
          />
          <MiniStat
            label="Left after those expenses"
            value={formatGhs(netAfterExpenses)}
            hint="Sales profit minus logged expenses"
          />
        </div>
      </section>

      {missingCostCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d7b1b7] bg-[#f8f2f3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6b3f48]">
            <strong>{missingCostCount}</strong> product
            {missingCostCount === 1 ? "" : "s"} still need a cost amount.
            Until you add them, “money in stock” stays near GH₵0 and profit
            looks like 100%.
          </p>
          <Link
            href="/admin/inventory?view=needs-cost"
            className="admin-btn shrink-0"
          >
            Show products needing cost
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: `All (${rows.length})` },
          { id: "needs-cost", label: `Need cost (${missingCostCount})` },
          {
            id: "low",
            label: `Low / out (${rows.filter((r) => r.health === "low" || r.health === "out").length})`,
          },
          {
            id: "ready",
            label: `In stock (${rows.filter((r) => !r.isPreorder && r.stock > 0).length})`,
          },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/inventory?view=${tab.id}`}
            className={`border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] transition ${
              view === tab.id
                ? "border-[#d7b1b7] bg-[#d7b1b7] text-white"
                : "border-[#d0d0d0] bg-white text-[#6f6f6f]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">
            Edit each product
          </h2>
          <p className="mt-1 text-sm text-[#6f6f6f]">
            Change the amounts, update sizes, then press{" "}
            <strong className="text-[#3a3a3a]">Save this product</strong>.
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-panel px-6 py-12 text-center text-sm text-[#6f6f6f]">
            Nothing in this filter.{" "}
            <Link href="/admin/inventory" className="underline">
              Show all
            </Link>
          </div>
        ) : (
          filtered.map((row) => (
            <InventoryProductCard
              key={row.product.id}
              productId={row.product.id}
              name={row.product.name}
              categoryName={row.product.category?.name}
              imageUrl={row.product.images[0]?.url}
              costPrice={row.cost}
              sellPrice={row.sell}
              isPreorder={row.isPreorder}
              variants={row.product.variants}
              highlight={params.focus === row.product.id}
              needsCost={row.needsCost}
            />
          ))
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form action={addInventoryExpense} className="admin-panel space-y-4 p-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              Log money spent on goods
            </h2>
            <p className="mt-1 text-sm text-[#6f6f6f]">
              Example: fabric from market, zippers, packaging bags, transport.
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
              <select
                id="category"
                name="category"
                className="input"
                defaultValue="FABRIC"
              >
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
            <input
              id="note"
              name="note"
              className="input"
              placeholder="Vendor, colours, etc."
            />
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

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8d5d8] px-4 py-3">
      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#6f6f6f]">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#6f6f6f]">{hint}</p>
    </div>
  );
}
