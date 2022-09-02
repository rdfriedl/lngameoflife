import fetch from "cross-fetch";
import { nanoid } from "nanoid";
import { LNBITS_READ_KEY, LNBITS_URL, WEBHOOK_DOMAIN } from "./env.js";

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
      webhook: WEBHOOK_DOMAIN + "/lnbits-webhook/" + invoiceId,
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

export async function getWalletInfo() {
  return await fetch(LNBITS_URL + "/api/v1/wallet", {
    headers: getAuthHeaders(),
  }).then((res) => res.json());
}
