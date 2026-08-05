const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack request failed");
  }
  return data.data as T;
}

export type PaystackInitResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyResult = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at: string | null;
  metadata?: Record<string, unknown>;
};

export async function initializeTransaction(input: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackFetch<PaystackInitResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountPesewas,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ["mobile_money", "card", "bank"],
      metadata: input.metadata,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackFetch<PaystackVerifyResult>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export function toPesewas(amountGhs: number) {
  return Math.round(amountGhs * 100);
}
