import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatGhs } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  expenseCategoryLabel,
  stockHealth,
} from "@/lib/inventory";
import {
  addInventoryExpense,
  deleteInventoryExpense,
  zeroAllInventoryMoney,
} from "./actions";
import { InventoryProductCard } from "@/components/admin/InventoryProductCard";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

type Props = {
  searchParams: Promise<{
    ok?: string;
    error?: string;
    edit?: string;
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
      take: 30,
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
      potential: retailValue - costValue,
      health,
      isPreorder,
      needsCost,
    };
  });

  const potentialProfit = inventoryRetail - inventoryCost;

  let salesRevenue = 0;
  let salesCogs = 0;
  for (const order of paidOrders) {
    salesRevenue += order.total;
    for (const item of order.items) {
      salesCogs += (item.unitCost || 0) * item.quantity;
    }
  }
  const realizedGross = salesRevenue - salesCogs;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = rows.filter((row) => {
    if (view === "needs-cost") return row.needsCost;
    if (view === "low") return row.health === "low" || row.health === "out";
    if (view === "ready") return !row.isPreorder && row.stock > 0;
    return true;
  });

  // Just-saved product is pulled out and shown under the editor
  const savedId = params.ok === "saved" ? params.edit : undefined;
  const listRows = filtered
    .filter((r) => r.product.id !== savedId)
    .sort((a, b) => a.product.name.localeCompare(b.product.name));
  const savedRow = savedId
    ? rows.find((r) => r.product.id === savedId) ?? null
    : null;

  const selectedId =
    params.edit && rows.some((r) => r.product.id === params.edit)
      ? params.edit
      : listRows[0]?.product.id ?? savedRow?.product.id ?? null;

  const selected =
    rows.find((r) => r.product.id === selectedId) ??
    savedRow ??
    null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#6f6f6f]">
            Your stock book
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[0.02em]">
            Inventory
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#6f6f6f]">
            Pick a product on the left, edit on the right. No long scrolling
            through every card.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={zeroAllInventoryMoney}>
            <button
              type="submit"
              className="border border-[#d0d0d0] bg-white px-4 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-[#6f6f6f] transition hover:border-[#c46b6b] hover:text-danger"
            >
              Zero all money
            </button>
          </form>
          <Link href="/admin/products/new" className="admin-btn">
            Add product
          </Link>
        </div>
      </div>

      {params.ok === "zeroed" && (
        <p className="rounded-xl border border-[#3d5a45]/25 bg-[#3d5a45]/10 px-4 py-3 text-sm text-success">
          All product costs set to GH₵0 and expense log cleared.
        </p>
      )}
      {params.ok === "expense" && (
        <p className="rounded-xl border border-[#3d5a45]/25 bg-[#3d5a45]/10 px-4 py-3 text-sm text-success">
          Expense logged.
        </p>
      )}
      {params.error === "expense" && (
        <p className="rounded-xl border border-[#c46b6b]/40 bg-[#c46b6b]/10 px-4 py-3 text-sm text-danger">
          Enter a title and amount for the expense.
        </p>
      )}
      {params.error === "price" && (
        <p className="rounded-xl border border-[#c46b6b]/40 bg-[#c46b6b]/10 px-4 py-3 text-sm text-danger">
          Sell price is required.
        </p>
      )}

      {/* Compact money strip */}
      <section className="grid gap-3 sm:grid-cols-3">
        <MoneyChip
          step="1"
          label="Money in stock"
          value={formatGhs(inventoryCost)}
          hint={`${unitsInStock} pieces at cost`}
        />
        <MoneyChip
          step="2"
          label="If all sell"
          value={formatGhs(inventoryRetail)}
          hint="At today’s sell prices"
        />
        <MoneyChip
          step="3"
          label="Profit waiting"
          value={formatGhs(potentialProfit)}
          hint={`Sales profit so far ${formatGhs(realizedGross - totalExpenses)}`}
          accent
        />
      </section>

      {missingCostCount > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#d7b1b7] bg-[#f8f2f3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6b3f48]">
            {missingCostCount} product{missingCostCount === 1 ? "" : "s"} still
            need a cost.
          </p>
          <Link
            href="/admin/inventory?view=needs-cost"
            className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#6b3f48] underline"
          >
            Show those only
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
        ].map((tab) => {
          const href =
            tab.id === "all"
              ? selectedId
                ? `/admin/inventory?edit=${selectedId}`
                : "/admin/inventory"
              : selectedId
                ? `/admin/inventory?view=${tab.id}&edit=${selectedId}`
                : `/admin/inventory?view=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={href}
              className={`border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] transition ${
                view === tab.id
                  ? "border-[#d7b1b7] bg-[#d7b1b7] text-white"
                  : "border-[#d0d0d0] bg-white text-[#6f6f6f]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Split workspace: list + one editor */}
      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="admin-panel flex max-h-[70vh] flex-col overflow-hidden lg:sticky lg:top-6">
          <div className="border-b border-[#eee] px-4 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#6f6f6f]">
              Products
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {listRows.length === 0 && !savedRow && (
              <li className="px-4 py-8 text-center text-sm text-[#6f6f6f]">
                Nothing in this filter.
              </li>
            )}
            {listRows.map((row) => {
              const active = row.product.id === selectedId;
              const href =
                view === "all"
                  ? `/admin/inventory?edit=${row.product.id}`
                  : `/admin/inventory?view=${view}&edit=${row.product.id}`;
              return (
                <li key={row.product.id}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 border-b border-black/[0.04] px-4 py-3 transition ${
                      active
                        ? "bg-[#f8f2f3]"
                        : "hover:bg-[#faf6f7]"
                    }`}
                  >
                    <div className="h-11 w-9 shrink-0 overflow-hidden rounded bg-[#f0e4e7]">
                      {row.product.images[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.product.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {row.product.name}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] text-[#6f6f6f]">
                        {row.isPreorder
                          ? "Pre-order"
                          : `${row.stock} pcs · cost ${formatGhs(row.cost)}`}
                        {row.needsCost ? " · needs cost" : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-4">
          {selected && selected.product.id !== savedId ? (
            <InventoryProductCard
              productId={selected.product.id}
              name={selected.product.name}
              categoryName={selected.product.category?.name}
              imageUrl={selected.product.images[0]?.url}
              costPrice={selected.cost}
              sellPrice={selected.sell}
              isPreorder={selected.isPreorder}
              variants={selected.product.variants}
              needsCost={selected.needsCost}
            />
          ) : !savedRow ? (
            <div className="admin-panel px-6 py-16 text-center text-sm text-[#6f6f6f]">
              Select a product on the left to edit cost and stock.
            </div>
          ) : null}

          {/* Saved product appears underneath the editor area */}
          {savedRow && (
            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#6f6f6f]">
                Just saved — shown underneath
              </p>
              <InventoryProductCard
                productId={savedRow.product.id}
                name={savedRow.product.name}
                categoryName={savedRow.product.category?.name}
                imageUrl={savedRow.product.images[0]?.url}
                costPrice={savedRow.cost}
                sellPrice={savedRow.sell}
                isPreorder={savedRow.isPreorder}
                variants={savedRow.product.variants}
                needsCost={savedRow.needsCost}
                justSaved
              />
            </div>
          )}
        </div>
      </section>

      <details className="admin-panel group">
        <summary className="cursor-pointer list-none px-6 py-4 marker:content-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl">
                Extra money spent on goods
              </h2>
              <p className="mt-1 text-sm text-[#6f6f6f]">
                Fabric, packaging, supplier trips · logged{" "}
                {formatGhs(totalExpenses)}
              </p>
            </div>
            <span className="text-[0.65rem] uppercase tracking-[0.14em] text-[#6f6f6f] group-open:hidden">
              Open
            </span>
            <span className="hidden text-[0.65rem] uppercase tracking-[0.14em] text-[#6f6f6f] group-open:inline">
              Close
            </span>
          </div>
        </summary>
        <div className="grid gap-6 border-t border-[#eee] px-6 py-6 lg:grid-cols-2">
          <form action={addInventoryExpense} className="space-y-4">
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
              <input id="note" name="note" className="input" />
            </div>
            <button type="submit" className="admin-btn">
              Add expense
            </button>
          </form>

          <ul className="divide-y divide-black/[0.05]">
            {expenses.length === 0 && (
              <li className="py-3 text-sm text-[#6f6f6f]">No expenses yet.</li>
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
      </details>
    </div>
  );
}

function MoneyChip({
  step,
  label,
  value,
  hint,
  accent = false,
}: {
  step: string;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        accent
          ? "border-[#d7b1b7] bg-[#f8f2f3]"
          : "border-[#e8d5d8] bg-white"
      }`}
    >
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#6b3f48]">
        {step} · {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#6f6f6f]">{hint}</p>
    </div>
  );
}
