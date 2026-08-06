"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/promos", label: "Promos" },
];

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] transition",
                active
                  ? "border-[#d7b1b7] bg-[#d7b1b7] !text-white"
                  : "border-[#d0d0d0] bg-white text-[#6f6f6f]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="mt-10 space-y-1">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 text-[0.78rem] uppercase tracking-[0.18em] transition",
              active
                ? "bg-white/[0.06] text-champagne"
                : "text-ivory/55 hover:bg-white/[0.03] hover:text-ivory",
            )}
          >
            <span
              className={cn(
                "h-px w-4 transition",
                active
                  ? "bg-champagne"
                  : "bg-transparent group-hover:bg-ivory/30",
              )}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
