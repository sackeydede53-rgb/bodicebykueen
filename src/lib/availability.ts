export type AvailabilityValue = "AVAILABLE" | "IN_STOCK" | "PREORDER";

export function availabilityLabel(value: AvailabilityValue | string) {
  switch (value) {
    case "AVAILABLE":
      return "Available";
    case "PREORDER":
      return "Pre-order";
    case "IN_STOCK":
    default:
      return "Ready to ship";
  }
}

export function isPreorder(value: AvailabilityValue | string) {
  return value === "PREORDER";
}

export function requiresStock(value: AvailabilityValue | string) {
  return value !== "PREORDER";
}

/** Ready-to-wear product with no sellable stock left */
export function isProductOutOfStock(
  availability: AvailabilityValue | string,
  variants: { stock: number }[],
) {
  if (isPreorder(availability)) return false;
  if (!variants.length) return true;
  return variants.every((v) => v.stock <= 0);
}
