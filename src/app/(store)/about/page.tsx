export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:px-10">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-champagne">
        The house
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl text-ivory md:text-6xl">
        Bodice by Kueen
      </h1>
      <div className="mt-10 space-y-6 text-sm leading-relaxed text-ivory/80 md:text-base">
        <p>
          Bodice by Kueen is a Ghanaian clothing house focused on elevated tops
          and body-conscious pieces — made for presence, from everyday to
          evening.
        </p>
        <p>
          Our ready-to-wear line includes basic tops, Nova tops, rhinestone cowl
          neck tops, bodysuits, and tube tops. Through pre-order, we also source
          a vast range of styles beyond the core collection.
        </p>
        <p>
          Based in Kumasi. Paying by Mobile Money is seamless through our
          Paystack checkout.
        </p>
      </div>
    </div>
  );
}
