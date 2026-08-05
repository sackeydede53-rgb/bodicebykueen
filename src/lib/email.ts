import nodemailer from "nodemailer";

type OrderEmailInput = {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  status: string;
  hasPreorder: boolean;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

export async function sendOrderConfirmationEmail(input: OrderEmailInput) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "Bodice by Kueen <orders@bodicebykueen.com>";
  const subject = `Order ${input.orderNumber} confirmed — Bodice by Kueen`;
  const preorderNote = input.hasPreorder
    ? "\nSome items in your order are pre-order pieces and will ship when ready."
    : "";

  const text = `Dear ${input.customerName},

Thank you for shopping with Bodice by Kueen.

Order: ${input.orderNumber}
Status: ${input.status}
Total: GHS ${input.total.toFixed(2)}
${preorderNote}

We will update you as your order progresses.

With love,
Bodice by Kueen`;

  if (!transporter) {
    console.log("[email:dev]", { to: input.to, subject, text });
    return { queued: false, logged: true };
  }

  await transporter.sendMail({
    from,
    to: input.to,
    subject,
    text,
  });

  return { queued: true, logged: false };
}
