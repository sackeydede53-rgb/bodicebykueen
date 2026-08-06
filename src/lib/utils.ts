export function formatGhs(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BBK-${stamp}-${rand}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Safari/iPad often won't render local .jfif as images — prefer .jpg. */
export function safariSafeImageUrl(url?: string | null) {
  if (!url) return url ?? undefined;
  // Only rewrite app-hosted uploads; Blob URLs already send image/jpeg.
  if (url.includes("/uploads/") && /\.jfif?$/i.test(url)) {
    return url.replace(/\.jfif?$/i, ".jpg");
  }
  return url;
}
