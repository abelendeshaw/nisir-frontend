import "server-only";

import { apiUrl } from "@/lib/env";

import type { CartLine, Totals, ZoneId, ShippingId } from "./pricing";
import type { PaymentMethodId } from "./store";

/**
 * The one door into nisir-backend for orders.
 *
 * Same shape as `lib/auth/backend.ts`: Server Actions call these, the browser
 * never talks to the backend directly and never sees `NISIR_API_URL`.
 *
 * Note what `placeOrder` sends — slugs, options, quantities — and what it
 * does not: prices. The backend re-derives every figure from the catalogue,
 * so what comes back is what the order actually costs, not what the cart
 * thought it did. If the two disagree, the server is right.
 */

export class OrderError extends Error {}

export type PlacedOrder = {
  id: string;
  status: string;
  placedAt: string;
  lines: CartLine[];
  totals: Totals;
  contact: { name: string; email: string; phone: string };
  address: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postal: string;
    country: string;
  } | null;
  zone: ZoneId;
  shipping: ShippingId;
  shippingLabel: string;
  payment: { method: PaymentMethodId; label: string; detail: string };
  promoCode: string | null;
  eta: [number, number];
  needsReview: boolean;
  /**
   * Whether the confirmation email actually left.
   *
   * The API never fails an order because mail failed, so this is the only
   * signal that a receipt is not on its way. Optional because an order placed
   * before the backend started recording it has no answer either way, and
   * "unknown" should not be printed as "failed".
   */
  confirmationEmailed?: boolean;
};

export type OrderSummary = {
  id: string;
  status: string;
  placedAt: string;
  totals: { totalCents: number };
  itemCount: number;
};

export type PlaceOrderInput = {
  lines: {
    kind: "catalogue" | "custom";
    qty: number;
    slug?: string;
    material?: string;
    finish?: string;
    size?: string;
    fileId?: string;
    custom?: {
      scale: number;
      infill: number;
      layerMm: number;
      rush: string;
      note?: string;
    };
  }[];
  contact: { name: string; email: string; phone: string };
  address?: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postal: string;
    country: string;
  };
  zone: string;
  shipping: string;
  promoCode?: string;
  paymentMethod: PaymentMethodId;
};

async function call<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = init;

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...rest,
      headers: {
        // Laravel picks between a JSON error and an HTML one on this header,
        // and picks before anything else gets a say. Without it an expired
        // token on a guarded route comes back 500 instead of 401.
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new OrderError("Can't reach the server right now. Try again in a moment.");
  }

  if (response.status === 404) throw new OrderError("No such order.");
  if (response.status === 401 || response.status === 403) {
    throw new OrderError("You aren't signed in to view that.");
  }

  if (!response.ok) {
    // The backend explains itself on a 400 — an unknown promo code, a
    // configuration a product doesn't offer, a sold-out object. Those are
    // worth showing verbatim rather than flattening into "something failed".
    const detail = await readMessage(response);
    throw new OrderError(
      detail ?? "Something went wrong on our end. Try again in a moment.",
    );
  }

  return (await response.json()) as T;
}

async function readMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(" ");
    return typeof body.message === "string" ? body.message : null;
  } catch {
    return null;
  }
}

/** Places the order. `token` attaches it to an account; without one it's a guest order. */
export function placeOrder(input: PlaceOrderInput, token?: string) {
  return call<PlacedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

/** The signed-in customer's own orders. */
export function myOrders(token: string) {
  return call<OrderSummary[]>("/orders", { token });
}

/** One order, for the receipt page. Works for a guest — the id is the key. */
export function getOrder(id: string, token?: string) {
  return call<PlacedOrder>(`/orders/${encodeURIComponent(id)}`, { token });
}
