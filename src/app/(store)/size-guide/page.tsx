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
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-24 md:px-10">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-label">
        Fit
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory">
        Size guide
      </h1>
      <p className="mt-6 text-sm text-stone">
        Use this chart to match letter sizes on our pieces with UK / Ghana
        dress sizes.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border-2 border-[#d7b1b7] bg-white shadow-sm">
        <div className="bg-[#d7b1b7] px-5 py-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.08em] text-white md:text-4xl">
            Size Chart
          </h2>
        </div>

        <table className="w-full text-center text-sm">
          <thead>
            <tr className="bg-[#d7b1b7] text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white">
              <th className="border-r border-white/35 px-4 py-3">Size</th>
              <th className="px-4 py-3">UK / GH Size</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.size}
                className="border-t-2 border-[#d7b1b7] text-base text-[#3a3a3a]"
              >
                <td className="border-r-2 border-[#d7b1b7] px-4 py-3.5 font-semibold">
                  {row.size}
                </td>
                <td className="px-4 py-3.5">{row.ukGh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-center text-sm italic text-stone">
        Please note: Sizes are in UK / GH measurements.
      </p>
    </div>
  );
}
