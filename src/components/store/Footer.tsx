import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-champagne/15 bg-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <div className="font-[family-name:var(--font-display)] text-3xl tracking-[0.08em]">
            Bodice
          </div>
          <div className="mt-1 text-[0.62rem] uppercase tracking-[0.32em] text-label">
            by Kueen
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone">
            Trendy tops, unique pieces, ready to wear — plus a wide pre-order
            catalogue for special pieces.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-label">
            Explore
          </p>
          <Link href="/shop" className="block text-ivory/75 hover:text-ivory">
            Shop
          </Link>
          <Link href="/about" className="block text-ivory/75 hover:text-ivory">
            About
          </Link>
          <Link href="/size-guide" className="block text-ivory/75 hover:text-ivory">
            Size Guide
          </Link>
          <Link href="/cart" className="block text-ivory/75 hover:text-ivory">
            Cart
          </Link>
        </div>
        <div className="space-y-3 text-sm text-stone">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-label">
            Visit
          </p>
          <p>Kumasi &amp; Koforidua, Ghana</p>
          <p>
            Customer care &amp; enquiry:{" "}
            <a
              href="mailto:bodicebykueen01@gmail.com"
              className="text-ivory/80 transition hover:text-ivory"
            >
              bodicebykueen01@gmail.com
            </a>
          </p>
          <p className="pt-4 text-xs uppercase tracking-[0.2em] text-champagne/50">
            © {new Date().getFullYear()} Bodice by Kueen
          </p>
        </div>
      </div>
    </footer>
  );
}
