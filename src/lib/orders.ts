import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatGhs } from "@/lib/utils";

export async function markOrderPaid(orderId: string, paymentUpdate: {
  channel?: string;
  rawResponse?: string;
  paidAt?: Date;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") {
    return order;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (!item.isPreorder && item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant && variant.stock >= item.quantity) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    if (order.payment) {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: "success",
          channel: paymentUpdate.channel,
          rawResponse: paymentUpdate.rawResponse,
          paidAt: paymentUpdate.paidAt ?? new Date(),
        },
      });
    }
  });

  const updated = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
  });

  await sendOrderConfirmationEmail({
    to: updated.customerEmail,
    customerName: updated.customerName,
    orderNumber: updated.orderNumber,
    total: updated.total,
    status: updated.status,
    hasPreorder: updated.hasPreorder,
  });

  return updated;
}

export { formatGhs };
