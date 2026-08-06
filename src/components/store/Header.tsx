"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/store/ThemeToggle";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop#search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/size-guide", label: "Size Guide" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition duration-500",
        scrolled || !isHome
          ? "border-b border-champagne/10 bg-ink/92 backdrop-blur-md"
          : "bg-gradient-to-b from-ink/80 via-ink/30 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[4.25rem] md:px-10">
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
                className={cn(
                  "text-[0.66rem] uppercase tracking-[0.22em] text-ivory/75 transition hover:text-champagne",
                  (link.href === "/shop"
                    ? pathname === "/shop"
                    : link.href.startsWith("/shop#")
                      ? false
                      : pathname.startsWith(link.href)) && "text-champagne",
                )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="font-[family-name:var(--font-display)] text-[1.45rem] leading-none tracking-[0.12em] text-ivory md:text-[1.7rem]">
            Bodice
          </div>
          <div className="mt-0.5 text-[0.52rem] uppercase tracking-[0.38em] text-label">
            by Kueen
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <ThemeToggle />
          <Link
            href="/shop"
            className="hidden text-[0.66rem] uppercase tracking-[0.22em] text-ivory/75 transition hover:text-champagne min-[400px]:inline md:hidden"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="text-[0.66rem] uppercase tracking-[0.22em] text-ivory/75 transition hover:text-champagne"
          >
            Cart ({itemCount})
          </Link>
        </div>
      </div>
    </header>
  );
}
