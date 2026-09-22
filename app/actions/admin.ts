"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import * as api from "@/lib/admin/api";
import { AdminApiError, AdminSessionEnded } from "@/lib/admin/api";
import { adminBase, requireAdminToken } from "@/lib/admin/dal";
import { createAdminSession, deleteAdminSession, readAdminSession } from "@/lib/admin/session";
import { ORDER_STATUSES, statusLabel, type AdminFormState, type OrderStatus } from "@/lib/admin/types";
import { CATALOG_TAG } from "@/lib/shop/catalog-server";
import { visitorHeaders } from "@/lib/visitor";

/**
 * Every admin mutation. Each one checks for an admin session itself — a
 * Server Action is a POST endpoint anyone can call by its id, so the page it
 * was rendered on having been guarded proves nothing. The backend then checks
 * the token again on the call each one makes.
 *
 * Anything that changes what a shopper sees (a price, a stock figure, a promo)
 * expires the storefront's cached catalogue with `updateTag`, so the change is
 * on the shelf at the next page view rather than within the minute.
 */

type Outcome<T> = { ok: true; value: T } | { ok: false; state: AdminFormState };

/**
 * Runs one backend call. An ended session goes back to the login form; a
 * refusal comes back as form state the caller can show; anything else is a
 * bug and is left to surface as one.
 */
async function attempt<T>(base: string, call: () => Promise<T>): Promise<Outcome<T>> {
  try {
    return { ok: true, value: await call() };
  } catch (cause) {
    if (cause instanceof AdminSessionEnded) redirect(`/${base}/login?expired=1`);
    if (cause instanceof AdminApiError) {
      return { ok: false, state: { message: cause.message, errors: cause.errors } };
    }
    throw cause;
  }
}

/**
 * The storefront's catalogue expires at once, and — because an action that
 * updates a tag is marked as having revalidated — the admin page that called
 * this re-renders with fresh data too.
 *
 * Not followed by `refresh()`: it would be redundant here, and it downgrades
 * the revalidation to "dynamic only", which left a form submitted before the
 * page had hydrated (Next's no-JavaScript action path) waiting forever for a
 * response.
 */
function changed(): void {
  updateTag(CATALOG_TAG);
}

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** A whole number from a field, or undefined when blank. NaN is a validation error for the API to name. */
function integer(form: FormData, key: string): number | undefined {
  const raw = text(form, key);
  return raw === "" ? undefined : Number.isInteger(Number(raw)) ? Number(raw) : Number.NaN;
}

/** Dollars typed into a field, as integer cents: "12.5" -> 1250. */
function cents(form: FormData, key: string): number | undefined {
  const raw = text(form, key).replace(/[$,\s]/g, "");
  if (raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.round(value * 100) : Number.NaN;
}

/* ------------------------------------------------------------------ auth */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function adminLogin(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const base = adminBase();
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");

  if (!EMAIL_RE.test(email) || password.length === 0) {
    return { message: "Enter your email and password." };
  }

  try {
    const admin = await api.adminLogin({ email, password }, await visitorHeaders());
    await createAdminSession({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      token: admin.token,
      expiresAt: Date.parse(admin.expiresAt),
    });
  } catch (cause) {
    if (cause instanceof AdminApiError) return { message: cause.message };
    throw cause;
  }

  redirect(`/${base}`);
}

/** Ends the session here and on the backend. */
export async function adminLogout(): Promise<void> {
  const base = adminBase();
  const session = await readAdminSession();
  if (session) await api.adminLogout(session.token);

  await deleteAdminSession();
  redirect(`/${base}/login`);
}

/* ---------------------------------------------------------------- orders */

export async function changeOrderStatus(
  orderId: string,
  _state: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();
  const status = text(form, "status") as OrderStatus;

  if (!ORDER_STATUSES.some((entry) => entry.id === status)) {
    return { message: "Pick a status." };
  }

  const outcome = await attempt(base, () => api.updateOrderStatus(token, orderId, status));
  if (!outcome.ok) return outcome.state;

  // Cancelling or reinstating moves stock, which the storefront shows.
  changed();
  return { ok: true, message: `Marked ${statusLabel(status).toLowerCase()}.` };
}

/* --------------------------------------------------------------- products */

/**
 * The product form, in the API's field names.
 *
 * Stock is only sent for a new product. An existing product's stock moves
 * through `adjustStock` instead — saving a form someone opened ten minutes
 * ago must not overwrite the units sold since with the figure on their screen.
 */
function productFields(form: FormData, isNew: boolean): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    slug: text(form, "slug").toLowerCase(),
    number: text(form, "number"),
    name: text(form, "name"),
    line: text(form, "line"),
    relic: text(form, "relic"),
    category: text(form, "category"),
    collection: text(form, "collection"),
    story: text(form, "story"),
    baseCents: cents(form, "price"),
    materials: form.getAll("materials").map(String),
    finishes: form.getAll("finishes").map(String),
    sizes: form.getAll("sizes").map(String),
    dimsMm: [integer(form, "dimsW"), integer(form, "dimsH"), integer(form, "dimsD")],
    weightG: integer(form, "weightG"),
    volumeCm3: text(form, "volumeCm3") === "" ? null : Number(text(form, "volumeCm3")),
    leadDays: [integer(form, "leadMin"), integer(form, "leadMax")],
    notes: text(form, "notes")
      .split("\n")
      .map((note) => note.trim())
      .filter(Boolean),
    digital: form.get("digital") === "on",
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
    sortOrder: integer(form, "sortOrder") ?? 0,
  };

  if (isNew) fields.stock = integer(form, "stock") ?? 0;

  return fields;
}

export async function saveProduct(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();
  const originalSlug = text(form, "originalSlug");
  const isNew = originalSlug === "";
  const fields = productFields(form, isNew);

  const outcome = await attempt(base, () =>
    isNew ? api.createProduct(token, fields) : api.updateProduct(token, originalSlug, fields),
  );
  if (!outcome.ok) return outcome.state;

  changed();

  // A new product, or a renamed one, lives at a new address now.
  if (isNew || outcome.value.slug !== originalSlug) {
    redirect(`/${base}/products/${encodeURIComponent(outcome.value.slug)}?saved=1`);
  }

  return { ok: true, message: "Saved." };
}

/** A correction (`+5`, `-1`) or a recount (`12`), from the stock panel. */
export async function adjustStock(slug: string, _state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();
  const mode = text(form, "mode");
  const amount = integer(form, "amount");

  if (amount === undefined || Number.isNaN(amount)) {
    return { message: "Enter a whole number." };
  }
  if (mode === "delta" && amount === 0) {
    return { message: "A correction of zero changes nothing." };
  }

  const body = mode === "count" ? { stock: amount } : { delta: amount };
  const outcome = await attempt(base, () => api.adjustStock(token, slug, body));
  if (!outcome.ok) return outcome.state;

  changed();
  return { ok: true, message: `${outcome.value.name}: ${outcome.value.stock} in stock.` };
}

/** Flip one of a product's switches from a list: on the shelf, or featured. */
export async function setProductFlag(
  slug: string,
  flag: "active" | "featured",
  value: boolean,
): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();

  const outcome = await attempt(base, () => api.updateProduct(token, slug, { [flag]: value }));
  if (!outcome.ok) return outcome.state;

  changed();
  return { ok: true };
}

export async function uploadProductImage(
  slug: string,
  _state: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();
  const image = form.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return { message: "Choose a JPG, PNG or WebP to upload." };
  }

  const outcome = await attempt(base, () => api.uploadProductImage(token, slug, image));
  if (!outcome.ok) return outcome.state;

  changed();
  return { ok: true, message: "Photograph updated." };
}

/* ----------------------------------------------------------------- promos */

/**
 * A promo, typed the way a person thinks of it — "15" percent, "$10" off —
 * and stored the way pricing reads it: a fraction, and cents.
 */
export async function savePromo(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();
  const kind = text(form, "kind");
  const rawValue = text(form, "value");

  let value: number | null = null;
  if (kind === "percent") value = rawValue === "" ? Number.NaN : Number(rawValue) / 100;
  if (kind === "amount") value = cents(form, "value") ?? Number.NaN;

  // Converted to ISO in the browser (see `PromoForm`): a `datetime-local`
  // value has no zone, and the zone the admin means is theirs, not this
  // server's.
  const expires = text(form, "expiresAtIso");

  const outcome = await attempt(base, () =>
    api.savePromo(token, {
      code: text(form, "code"),
      label: text(form, "label"),
      kind,
      value,
      minimumCents: cents(form, "minimum") ?? null,
      active: form.get("active") === "on",
      expiresAt: expires === "" ? null : expires,
    }),
  );
  if (!outcome.ok) return outcome.state;

  changed();
  return { ok: true, message: `${outcome.value.code} saved.` };
}

export async function deletePromo(code: string): Promise<AdminFormState> {
  const { base, token } = await requireAdminToken();

  const outcome = await attempt(base, () => api.deletePromo(token, code));
  if (!outcome.ok) return outcome.state;

  changed();
  return { ok: true, message: `${code} deleted.` };
}
