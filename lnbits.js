import fetch from "cross-fetch";
import { nanoid } from "nanoid";
import { LNBITS_READ_KEY, LNBITS_URL, PUBLIC_DOMAIN } from "./env.js";

function getAuthHeaders() {
  return {
    "X-Api-Key": LNBITS_READ_KEY,
  };
}

const pendingInvoices = new Map();

export function invoicePaid(invoiceId) {
  console.log(`Payed Invoice: ${invoiceId}`);
  pendingInvoices.get(invoiceId)?.();
}

export async function createInvoice(amount, callback) {
  if (!amount) throw new Error("missing amount");

  const invoiceId = nanoid();
  const invoice = await fetch(LNBITS_URL + "/api/v1/payments", {
    method: "POST",
    body: JSON.stringify({
      out: false,
      amount,
      memo: `Add cells`,
      webhook: PUBLIC_DOMAIN + "/lnbits-webhook/" + invoiceId,
    }),
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  if (callback) {
    console.log(`Create Invoice: ${invoiceId}`);
    pendingInvoices.set(invoiceId, callback);
  }

  return invoice;
}
