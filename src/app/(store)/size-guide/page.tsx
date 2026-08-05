export const metadata = {
  title: "Size Guide",
};

const rows = [
  { size: "XS", bust: "80–84", waist: "62–66", hip: "86–90" },
  { size: "S", bust: "84–88", waist: "66–70", hip: "90–94" },
  { size: "M", bust: "88–92", waist: "70–74", hip: "94–98" },
  { size: "L", bust: "92–98", waist: "74–80", hip: "98–104" },
  { size: "XL", bust: "98–104", waist: "80–86", hip: "104–110" },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:px-10">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-champagne">
        Fit
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory">
        Size guide
      </h1>
      <p className="mt-6 text-sm text-stone">
        Measurements in centimetres. If you are between sizes, we recommend
        sizing up for structured pieces.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-champagne/25 text-[0.7rem] uppercase tracking-[0.16em] text-champagne">
              <th className="py-3 pr-4">Size</th>
              <th className="py-3 pr-4">Bust</th>
              <th className="py-3 pr-4">Waist</th>
              <th className="py-3">Hip</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className="border-b border-champagne/10">
                <td className="py-4 pr-4 text-ivory">{row.size}</td>
                <td className="py-4 pr-4 text-stone">{row.bust}</td>
                <td className="py-4 pr-4 text-stone">{row.waist}</td>
                <td className="py-4 text-stone">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
