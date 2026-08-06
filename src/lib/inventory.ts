export const EXPENSE_CATEGORIES = [
  { value: "FABRIC", label: "Fabric / materials" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "SHIPPING_IN", label: "Supplier / shipping in" },
  { value: "LABOUR", label: "Labour / maker fees" },
  { value: "OTHER", label: "Other" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export function expenseCategoryLabel(value: string) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value
  );
}

export function marginPercent(sellPrice: number, costPrice: number) {
  if (sellPrice <= 0) return 0;
  return ((sellPrice - costPrice) / sellPrice) * 100;
}

export function stockHealth(
  stock: number,
  isPreorder: boolean,
): "preorder" | "out" | "low" | "ok" {
  if (isPreorder) return "preorder";
  if (stock <= 0) return "out";
  if (stock <= 2) return "low";
  return "ok";
}
