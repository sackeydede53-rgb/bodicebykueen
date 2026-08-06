import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { initializeTransaction, toPesewas } from "@/lib/paystack";
import { randomUUID } from "crypto";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(9),
  callNumber: z.string().min(9),
  addressLine1: z.string().min(3),
  city: z.string().min(2),
  region: z.string().optional(),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: true },
    });

    if (variants.length !== data.items.length) {
      return NextResponse.json(
        { error: "One or more items are unavailable." },
        { status: 400 },
      );
    }

    const lineItems = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const product = variant.product;
      if (!product.published) {
        throw new Error(`${product.name} is unavailable.`);
      }
      const isPreorder = product.availability === "PREORDER";
      if (!isPreorder && variant.stock < item.quantity) {
        throw new Error(`${product.name} (${variant.size}) is out of stock.`);
      }
      return {
        variant,
        product,
        quantity: item.quantity,
        isPreorder,
      };
    });

    const subtotal = lineItems.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );

    let discountAmount = 0;
    let promoCodeId: string | undefined;
    let promoCodeUsed: string | undefined;

    if (data.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.toUpperCase() },
      });
      if (promo?.active && (!promo.expiresAt || promo.expiresAt > new Date())) {
        discountAmount =
          promo.discountType === "PERCENT"
            ? Math.round(((subtotal * promo.discountValue) / 100) * 100) / 100
            : Math.min(promo.discountValue, subtotal);
        promoCodeId = promo.id;
        promoCodeUsed = promo.code;
      }
    }

    const total = Math.max(0, subtotal - discountAmount);
    const hasPreorder = lineItems.some((l) => l.isPreorder);
    const orderNumber = generateOrderNumber();
    const reference = `bbk_${randomUUID().replace(/-/g, "")}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.callNumber || null,
        city: data.city,
        region: data.region || null,
        notes: data.notes || null,
        subtotal,
        discountAmount,
        total,
        promoCodeId,
        promoCodeUsed,
        hasPreorder,
        items: {
          create: lineItems.map((line) => ({
            variantId: line.variant.id,
            productName: line.product.name,
            size: line.variant.size,
            color: line.variant.color,
            unitPrice: line.product.price,
            unitCost: line.product.costPrice || 0,
            quantity: line.quantity,
            isPreorder: line.isPreorder,
            preorderEta: line.product.preorderEta,
          })),
        },
        payment: {
          create: {
            paystackReference: reference,
            amount: total,
            currency: "GHS",
            status: "pending",
          },
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const init = await initializeTransaction({
      email: data.customerEmail,
      amountPesewas: toPesewas(total),
      reference,
      callbackUrl: `${appUrl}/order/confirmation`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: data.customerPhone,
      },
    });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { paystackAccessCode: init.access_code },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      authorizationUrl: init.authorization_url,
      reference: init.reference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to start checkout.";
    const isPaystack =
      message.toLowerCase().includes("paystack") ||
      message.includes("sk_test_replace_me");
    return NextResponse.json(
      {
        error: isPaystack
          ? "Payment provider is not configured. Add your Paystack secret key in .env."
          : message,
      },
      { status: 400 },
    );
  }
}
