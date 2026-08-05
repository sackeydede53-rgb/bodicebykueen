import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/orders";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: {
      reference: string;
      status: string;
      channel?: string;
      paid_at?: string;
    };
  };

  if (event.event === "charge.success" && event.data.status === "success") {
    const payment = await prisma.payment.findUnique({
      where: { paystackReference: event.data.reference },
    });
    if (payment) {
      await markOrderPaid(payment.orderId, {
        channel: event.data.channel,
        rawResponse: rawBody,
        paidAt: event.data.paid_at
          ? new Date(event.data.paid_at)
          : new Date(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
