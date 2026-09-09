export const metadata = {
  title: "Size Guide",
};

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:px-10">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-label">
        Fit
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory">
        Size guide
      </h1>
      <p className="mt-6 max-w-xl text-sm text-stone">
        Match our letter sizes with UK / Ghana dress sizes using the chart
        below.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-champagne/20 bg-white p-3 shadow-sm sm:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uploads/size-chart.svg"
          alt="Size chart: S 6–8, M 10–12, L 12–14, XL 14–16, XXL 16–18. UK / GH measurements."
          className="mx-auto h-auto w-full max-w-lg"
        />
      </div>
    </div>
  );
}
