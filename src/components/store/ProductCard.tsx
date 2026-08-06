"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { availabilityLabel } from "@/lib/availability";
import { formatGhs, cn } from "@/lib/utils";

type ProductCardProps = {
  name: string;
  slug: string;
  price: number;
  imageUrl?: string | null;
  imageUrls?: string[];
  availability: "AVAILABLE" | "IN_STOCK" | "PREORDER";
  preorderEta?: string | null;
  outOfStock?: boolean;
};

export function ProductCard({
  name,
  slug,
  price,
  imageUrl,
  imageUrls,
  availability,
  preorderEta,
  outOfStock = false,
}: ProductCardProps) {
  const slides = (imageUrls?.filter(Boolean).length
    ? imageUrls.filter(Boolean)
    : imageUrl
      ? [imageUrl]
      : []) as string[];
  const [index, setIndex] = useState(0);
  const canSlide = slides.length > 1;
  const current = slides[index];

  function stopNav(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <Link href={`/shop/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-soft">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={name}
            className={cn(
              "h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]",
              outOfStock && "opacity-55",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone">
            No image
          </div>
        )}

        {outOfStock ? (
          <div className="absolute left-3 top-3 rounded-full bg-[#6b3f48] px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white">
            Out of stock
          </div>
        ) : (
          availability !== "AVAILABLE" && (
            <div className="absolute left-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-champagne backdrop-blur-sm">
              {availabilityLabel(availability)}
            </div>
          )
        )}

        {canSlide && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                stopNav(e);
                setIndex((i) => (i - 1 + slides.length) % slides.length);
              }}
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white opacity-100 backdrop-blur-sm transition md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                stopNav(e);
                setIndex((i) => (i + 1) % slides.length);
              }}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white opacity-100 backdrop-blur-sm transition md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={`${slug}-dot-${i}`}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  onClick={(e) => {
                    stopNav(e);
                    setIndex(i);
                  }}
                  className={cn(
                    "h-1 w-1 rounded-full transition",
                    i === index ? "w-3 bg-champagne" : "bg-ivory/45",
                  )}
                />
              ))}
            </div>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex border border-champagne/50 bg-ink/50 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-ivory backdrop-blur-sm">
            {outOfStock ? "View details →" : "View piece →"}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-ivory transition group-hover:text-champagne">
            {name}
          </h3>
          {outOfStock ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b3f48]">
              Out of stock
            </p>
          ) : (
            availability === "PREORDER" &&
            preorderEta && (
              <p className="mt-1 text-xs text-stone">Est. {preorderEta}</p>
            )
          )}
        </div>
        <p className="shrink-0 pt-1 text-sm font-semibold text-label">
          {formatGhs(price)}
        </p>
      </div>
    </Link>
  );
}
