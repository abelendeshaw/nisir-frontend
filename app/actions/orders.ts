"use server";

import { getUser } from "@/lib/auth/dal";
import { apiUrl } from "@/lib/env";
import {
  OrderError,
  placeOrder,
  type PlacedOrder,
  type PlaceOrderInput,
} from "@/lib/shop/orders-server";

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; message: string };

/**
 * Checkout's one call to the server.
 *
 * The cart supplies intent — which objects, in which configuration, how many
 * — and the backend prices it. The order that comes back is the source of
 * truth for the receipt, including a total that may differ from the one the
 * cart was showing if a price or a promo moved underneath it.
 */
export async function submitOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const user = await getUser();

  try {
    const order = await placeOrder(input, user?.token);
    return { ok: true, order };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof OrderError
          ? cause.message
          : "Something went wrong placing the order.",
    };
  }
}

/**
 * Uploads a custom model and prices it against the server's own measurement
 * of the file, at the moment the visitor commits to the run.
 *
 * The browser has already parsed the same file to drive the live preview and
 * the price that moves while sliders drag; this is where the file the print
 * floor needs actually arrives, and where the numbers it was priced on stop
 * being the browser's word for it.
 */
export async function uploadCustomModel(
  form: FormData,
): Promise<
  | { ok: true; fileId: string; fileName: string; stats: Record<string, unknown> }
  | { ok: false; message: string }
> {
  const file = form.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file was selected." };
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name);

  let response: Response;
  try {
    response = await fetch(apiUrl("/custom/uploads"), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: upstream,
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "Can't reach the server right now." };
  }

  if (!response.ok) {
    // A 422 here is the server saying it couldn't read the mesh — the exact
    // sentence is more useful to the visitor than a generic failure.
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    return {
      ok: false,
      message: body?.message ?? "That model could not be read.",
    };
  }

  const data = (await response.json()) as {
    fileId: string;
    fileName: string;
    stats: Record<string, unknown>;
  };
  return { ok: true, ...data };
}
