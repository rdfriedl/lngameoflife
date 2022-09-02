import "dotenv/config";

export const DISABLE_LN_PAYMENTS = !!process.env.DISABLE_LN_PAYMENTS;
export const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;
export const LNBITS_URL = process.env.LNBITS_URL;
export const LNBITS_WALLET_ID = process.env.LNBITS_WALLET_ID;
export const LNBITS_READ_KEY = process.env.LNBITS_READ_KEY;
