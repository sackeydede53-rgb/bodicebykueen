"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ShopSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <div id="search" className="mt-8 scroll-mt-28">
      <p className="mb-3 text-[0.68rem] uppercase tracking-[0.22em] text-champagne">
        Search products
      </p>
      <form
        onSubmit={onSearch}
        className="flex w-full max-w-2xl items-center gap-3 border border-champagne/40 bg-ink-soft/80 px-4 py-3.5"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a product name…"
          className="w-full bg-transparent text-base text-ivory outline-none placeholder:text-stone"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="shrink-0 bg-champagne px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-ink transition hover:bg-champagne-deep"
        >
          Search
        </button>
      </form>
    </div>
  );
}
