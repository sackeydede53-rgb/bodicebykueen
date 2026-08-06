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
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition duration-500",
        scrolled || !isHome || menuOpen
          ? "border-b border-champagne/10 bg-ink/92 backdrop-blur-md"
          : "bg-gradient-to-b from-ink/80 via-ink/30 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] md:h-[4.25rem] md:px-10">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-label/35 bg-ink/40 text-ivory lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
          <span className="relative block h-3.5 w-4">
            <span
              className={cn(
                "absolute left-0 top-0 h-0.5 w-4 bg-current transition",
                menuOpen && "top-1.5 rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-0.5 w-4 bg-current transition",
                menuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-3 h-0.5 w-4 bg-current transition",
                menuOpen && "top-1.5 -rotate-45",
              )}
            />
          </span>
        </button>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-label transition hover:text-ivory",
                (link.href === "/shop"
                  ? pathname === "/shop"
                  : link.href.startsWith("/shop#")
                    ? false
                    : pathname.startsWith(link.href)) && "text-ivory",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          onClick={() => setMenuOpen(false)}
        >
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
            href="/cart"
            className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-label transition hover:text-ivory"
            onClick={() => setMenuOpen(false)}
          >
            Cart ({itemCount})
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-champagne/15 bg-ink px-5 py-5 lg:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-3 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-ivory"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
