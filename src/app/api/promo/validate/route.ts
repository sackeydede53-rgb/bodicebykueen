import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
  });

  if (!promo || !promo.active) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Promo code expired" }, { status: 400 });
  }

  const discountAmount =
    promo.discountType === "PERCENT"
      ? Math.round(((parsed.data.subtotal * promo.discountValue) / 100) * 100) /
        100
      : Math.min(promo.discountValue, parsed.data.subtotal);

  return NextResponse.json({
    code: promo.code,
    discountAmount,
    discountType: promo.discountType,
  });
}
