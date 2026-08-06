"use client";

import { useCallback, useEffect, useState } from "react";
import { cn, safariSafeImageUrl } from "@/lib/utils";

type SlideImage = {
  id: string;
  url: string;
  alt?: string | null;
};

type Props = {
  images: SlideImage[];
  productName: string;
};

export function ProductImageSlider({ images, productName }: Props) {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const count = images.length;
  const canSlide = count > 1;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!canSlide) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSlide, prev, next]);

  if (!count) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-ink-soft text-stone">
        No image
      </div>
    );
  }

  const current = images[index];

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-ink-soft"
        onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchStartX == null || !canSlide) return;
          const delta = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(delta) > 40) {
            if (delta > 0) prev();
            else next();
          }
          setTouchStartX(null);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={safariSafeImageUrl(current.url)}
          alt={current.alt ?? productName}
          className="h-full w-full object-cover"
        />

        {canSlide && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-champagne/40 bg-ink/70 text-ivory backdrop-blur-sm transition hover:border-champagne hover:text-champagne"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-champagne/40 bg-ink/70 text-ivory backdrop-blur-sm transition hover:border-champagne hover:text-champagne"
            >
              ›
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition",
                    i === index ? "bg-champagne w-5" : "bg-ivory/40 hover:bg-ivory/70",
                  )}
                />
              ))}
            </div>

            <div className="absolute right-3 top-3 bg-ink/70 px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-champagne backdrop-blur-sm">
              {index + 1} / {count}
            </div>
          </>
        )}
      </div>

      {canSlide && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "aspect-square overflow-hidden border transition",
                i === index
                  ? "border-champagne"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safariSafeImageUrl(img.url)}
                alt={img.alt ?? `${productName} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
