/**
 * Payment, simulated.
 *
 * There is no gateway behind this. The validation is real — Luhn, expiry, CVC
 * length, brand detection — because getting a card field wrong is a design
 * problem you can solve before you have a merchant account. The authorisation
 * is not: it waits, then decides from the card number, so both halves of the
 * flow (the receipt and the decline) can actually be walked through.
 *
 * Nothing entered here is transmitted, stored, or written to disk. The card
 * draft lives in component state and dies with the page.
 */

import type { PaymentMethodId } from "./store";

export type CardDraft = {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
};

export const emptyCard: CardDraft = { number: "", name: "", expiry: "", cvc: "" };

export type Brand = "Visa" | "Mastercard" | "Amex" | "Discover" | null;

export function detectBrand(input: string): Brand {
  const digits = input.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(011|5)/.test(digits)) return "Discover";
  return null;
}

/** Amex groups 4-6-5; everyone else groups in fours. */
export function formatCardNumber(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 19);
  const groups = detectBrand(digits) === "Amex" ? [4, 6, 5] : [4, 4, 4, 4, 3];
  const parts: string[] = [];
  let cursor = 0;
  for (const size of groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.join(" ");
}

export function formatExpiry(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** The check every card number has satisfied since 1954. */
export function luhn(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let value = Number(digits[i]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}

export function validateCard(card: CardDraft) {
  const errors: Record<string, string> = {};
  const digits = card.number.replace(/\D/g, "");
  const brand = detectBrand(digits);

  if (!digits) errors.number = "A card number is needed.";
  else if (digits.length < (brand === "Amex" ? 15 : 16)) errors.number = "That number is short.";
  else if (!luhn(digits)) errors.number = "That number fails its checksum — check the digits.";

  if (!card.name.trim()) errors.name = "The name as printed on the card.";

  const [month, year] = card.expiry.split("/");
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!month || !year || year.length < 2) {
    errors.expiry = "MM/YY.";
  } else if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
    errors.expiry = "Months run 01 to 12.";
  } else {
    const now = new Date();
    const century = Math.floor(now.getFullYear() / 100) * 100;
    const expires = new Date(century + yearNumber, monthNumber, 0, 23, 59, 59);
    if (expires < now) errors.expiry = "That card has expired.";
  }

  const cvcLength = brand === "Amex" ? 4 : 3;
  if (!/^\d+$/.test(card.cvc)) errors.cvc = "Digits only.";
  else if (card.cvc.length !== cvcLength) errors.cvc = `${cvcLength} digits for ${brand ?? "this card"}.`;

  return errors;
}

/* ------------------------------------------------------------- gateway -- */

export type Decline = {
  code: string;
  title: string;
  detail: string;
  /** Whether trying the same card again could plausibly work. */
  retryable: boolean;
};

const declines: Record<string, Decline> = {
  "0002": {
    code: "card_declined",
    title: "The bank declined it",
    detail:
      "No reason was given, which is normal — banks do not explain declines to merchants. Another card usually clears.",
    retryable: false,
  },
  "0069": {
    code: "expired_card",
    title: "That card has expired",
    detail: "The expiry date the bank holds has passed. Check the card, or use another one.",
    retryable: false,
  },
  "9995": {
    code: "insufficient_funds",
    title: "Insufficient funds",
    detail: "The card is live but will not cover the total. Nothing has been charged.",
    retryable: false,
  },
  "0119": {
    code: "processing_error",
    title: "The processor timed out",
    detail:
      "Our end never heard back. No charge was made — this one is worth simply trying again.",
    retryable: true,
  },
};

/** Numbers a visitor can use to walk the unhappy paths on purpose. */
export const testCards = [
  { number: "4242 4242 4242 4242", outcome: "Approved" },
  { number: "4000 0000 0000 0002", outcome: "Declined by bank" },
  { number: "4000 0000 0000 0069", outcome: "Expired card" },
  { number: "4000 0000 0000 9995", outcome: "Insufficient funds" },
  { number: "4000 0000 0000 0119", outcome: "Processor timeout" },
];

export type AuthResult = { ok: true; detail: string } | ({ ok: false } & Decline);

export function authorise(
  method: PaymentMethodId,
  card: CardDraft,
  reference: string,
): Promise<AuthResult> {
  // The wait is the point: a button that resolves instantly reads as fake, and
  // the disabled/processing state is a real part of the design.
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (method !== "card") {
        resolve({ ok: true, detail: labelFor(method, card, reference) });
        return;
      }
      const digits = card.number.replace(/\D/g, "");
      const decline = declines[digits.slice(-4)];
      resolve(
        decline
          ? { ok: false, ...decline }
          : { ok: true, detail: `${detectBrand(digits) ?? "Card"} ending ${digits.slice(-4)}` },
      );
    }, 1700);
  });
}

function labelFor(method: PaymentMethodId, card: CardDraft, reference: string) {
  switch (method) {
    case "telebirr":
      return `telebirr — approved on handset (${reference})`;
    case "cbe":
      return `CBE Birr — approved on handset (${reference})`;
    default:
      return `Bank transfer — reference ${reference}`;
  }
}

export function declineFromCode(code: string | null): Decline {
  const match = Object.values(declines).find((entry) => entry.code === code);
  return (
    match ?? {
      code: "unknown",
      title: "The payment did not go through",
      detail:
        "Something between us and the bank failed, and we would rather say so than guess. Nothing has been charged.",
      retryable: true,
    }
  );
}
