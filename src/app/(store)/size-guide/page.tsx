import Link from "next/link";

export const metadata = {
  title: "Size Guide",
};

const rows = [
  { size: "S", ukGh: "6 – 8" },
  { size: "M", ukGh: "10 – 12" },
  { size: "L", ukGh: "12 – 14" },
  { size: "XL", ukGh: "14 – 16" },
  { size: "XXL", ukGh: "16 – 18" },
];

export default function SizeGuidePage() {
  return (
    <div className="pb-24 pt-20 md:pt-24">
      {/* Soft editorial intro */}
      <section className="relative overflow-hidden px-5 pb-10 pt-6 md:px-10 md:pb-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(215,177,183,0.45),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="fade-up text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-label">
            Fit · Bodice by Kueen
          </p>
          <h1 className="fade-up-delay mt-4 font-[family-name:var(--font-display)] text-5xl tracking-[0.04em] text-ivory md:text-7xl">
            Size guide
          </h1>
          <p className="fade-up-delay-2 mx-auto mt-5 max-w-lg text-sm leading-relaxed text-stone md:text-base">
            Find your letter size using UK / Ghana dress sizes — then shop with
            confidence.
          </p>
        </div>
      </section>

      {/* Chart as the visual centrepiece */}
      <section className="px-5 md:px-10">
        <div className="mx-auto max-w-xl overflow-hidden rounded-[1.75rem] border border-[#d7b1b7]/50 bg-white shadow-[0_24px_60px_rgba(107,63,72,0.08)]">
          <div className="relative bg-[#e18aa0] px-6 py-8 text-center md:py-10">
            <div className="mx-auto mb-4 h-px w-24 bg-white/80 md:w-32" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-[0.14em] text-white md:text-5xl">
              SIZE CHART
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-white/80 md:w-32" />
          </div>

          <div className="grid grid-cols-2 bg-[#e18aa0] text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white">
            <div className="border-r border-white/35 px-4 py-3.5">Size</div>
            <div className="px-4 py-3.5">UK / GH Size</div>
          </div>

          <ul>
            {rows.map((row, index) => (
              <li
                key={row.size}
                className="grid grid-cols-2 border-t border-[#e18aa0] text-center transition hover:bg-[#fdf6f8]"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="border-r border-[#e18aa0] px-4 py-4 font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[#3a3a3a] md:py-5 md:text-3xl">
                  {row.size}
                </div>
                <div className="flex items-center justify-center px-4 py-4 text-base font-semibold tracking-wide text-[#3a3a3a] md:py-5 md:text-lg">
                  {row.ukGh}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm italic text-stone">
          Please note: Sizes are in UK / GH measurements.
        </p>
      </section>

      {/* One tip + CTA — single purpose */}
      <section className="mx-auto mt-16 max-w-3xl px-5 text-center md:mt-20 md:px-10">
        <div className="rounded-[1.75rem] bg-gradient-to-b from-[#eac5cc]/55 to-[#f8f2f3] px-6 py-12 md:px-12 md:py-14">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-label">
            Fit tip
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-ivory md:text-4xl">
            Between two sizes?
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone md:text-base">
            Choose the larger size for a softer, easier fit — or message us if
            you want help picking.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/shop" className="btn-primary">
              Shop pieces
            </Link>
            <a
              href="mailto:bodicebykueen01@gmail.com"
              className="btn-ghost"
            >
              Ask for fit help
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
