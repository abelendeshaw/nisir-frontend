import "server-only";

import { apiUrl } from "@/lib/env";
import type {
  AdminOrder,
  AdminOrderRow,
  AdminProduct,
  AdminPromo,
  AdminUser,
  BestSeller,
  Customer,
  Dashboard,
  OrderStatus,
  Paginated,
  ProductOptions,
} from "./types";

/**
 * The one door into nisir-backend-php's `/admin` API. Server code only — the
 * admin token never reaches the browser, and neither does `NISIR_API_URL`.
 *
 * Unlike the storefront's session check, this fails closed. A storefront
 * that cannot reach the API keeps a customer signed in, because the
 * alternative is signing out every shopper during a blip. The admin panel is
 * the opposite trade: nothing here is worth doing on an unconfirmed session,
 * so "could not check" is never treated as "checked".
 */

/** The backend no longer honours this admin token: expired, revoked, or its holder demoted. */
export class AdminSessionEnded extends Error {}

/** The backend refused or failed a request, with its own explanation when it gave one. */
export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

function withQuery(path: string, query: Query = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function send(
  path: string,
  { token, method = "GET", body, headers = {} }: { token?: string; method?: string; body?: unknown; headers?: Record<string, string> },
): Promise<Response> {
  const isForm = body instanceof FormData;

  try {
    return await fetch(apiUrl(path), {
      method,
      headers: {
        // Laravel chooses a JSON error over an HTML one on this header.
        Accept: "application/json",
        ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError("Can't reach the API right now. Try again in a moment.", 0);
  }
}

async function readError(response: Response): Promise<AdminApiError> {
  let message: string | null = null;
  let errors: Record<string, string[]> = {};
  try {
    const body = (await response.json()) as { message?: unknown; errors?: unknown };
    if (typeof body.message === "string" && body.message.trim() !== "") message = body.message;
    if (body.errors && typeof body.errors === "object") errors = body.errors as Record<string, string[]>;
  } catch {
    // Not JSON — a proxy's error page, most likely. The generic sentence will do.
  }

  if (response.status === 429) {
    const seconds = Number(response.headers.get("Retry-After"));
    message = Number.isFinite(seconds) && seconds > 0
      ? `Too many attempts. Try again in ${Math.ceil(seconds)} seconds.`
      : "Too many attempts. Wait a minute and try again.";
  }

  return new AdminApiError(
    message ?? (response.status >= 500 ? "The API had a problem. Try again in a moment." : "That request was refused."),
    response.status,
    errors,
  );
}

async function request<T>(token: string, path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await send(path, { ...init, token });

  if (response.status === 401 || response.status === 403) throw new AdminSessionEnded();
  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/* ---------------------------------------------------------------- session */

export type AdminLogin = AdminUser & { token: string; expiresAt: string };

/** Signs in. A 401 here is wrong credentials, not an ended session. */
export async function adminLogin(
  fields: { email: string; password: string },
  visitor: Record<string, string>,
): Promise<AdminLogin> {
  const response = await send("/admin/auth/login", { method: "POST", body: fields, headers: visitor });

  if (response.status === 401) {
    throw new AdminApiError("Those details don’t open the admin panel.", 401);
  }
  if (!response.ok) throw await readError(response);

  return (await response.json()) as AdminLogin;
}

export function adminSession(token: string) {
  return request<AdminUser & { expiresAt: string | null }>(token, "/admin/auth/session");
}

/** Best effort: signing out of this browser happens whether or not the API answers. */
export async function adminLogout(token: string): Promise<void> {
  try {
    await send("/admin/auth/session", { method: "DELETE", token });
  } catch {
    // Deliberately swallowed.
  }
}

/* --------------------------------------------------------------- reports */

export function dashboard(token: string) {
  return request<Dashboard>(token, "/admin/dashboard");
}

export function bestSellers(token: string, days: number | null) {
  return request<{ days: number | null; sellers: BestSeller[] }>(token, withQuery("/admin/best-sellers", { days }));
}

/* ---------------------------------------------------------------- orders */

export function orders(token: string, query: { status?: string; q?: string; page?: number; review?: boolean }) {
  return request<Paginated<AdminOrderRow>>(token, withQuery("/admin/orders", query));
}

export function order(token: string, id: string) {
  return request<AdminOrder>(token, `/admin/orders/${encodeURIComponent(id)}`);
}

export function updateOrderStatus(token: string, id: string, status: OrderStatus) {
  return request<AdminOrder>(token, `/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { status },
  });
}

/* --------------------------------------------------------------- products */

export function products(token: string, query: { q?: string; status?: string; stock?: string } = {}) {
  return request<AdminProduct[]>(token, withQuery("/admin/products", query));
}

export function product(token: string, slug: string) {
  return request<AdminProduct>(token, `/admin/products/${encodeURIComponent(slug)}`);
}

export function productOptions(token: string) {
  return request<ProductOptions>(token, "/admin/options");
}

export function createProduct(token: string, body: Record<string, unknown>) {
  return request<AdminProduct>(token, "/admin/products", { method: "POST", body });
}

export function updateProduct(token: string, slug: string, body: Record<string, unknown>) {
  return request<AdminProduct>(token, `/admin/products/${encodeURIComponent(slug)}`, { method: "PATCH", body });
}

export function deactivateProduct(token: string, slug: string) {
  return request<void>(token, `/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export function adjustStock(token: string, slug: string, body: { delta: number } | { stock: number }) {
  return request<AdminProduct>(token, `/admin/products/${encodeURIComponent(slug)}/stock`, {
    method: "PATCH",
    body,
  });
}

export function uploadProductImage(token: string, slug: string, image: File) {
  const form = new FormData();
  form.append("image", image, image.name);
  return request<AdminProduct>(token, `/admin/products/${encodeURIComponent(slug)}/image`, {
    method: "POST",
    body: form,
  });
}

/* ----------------------------------------------------------------- promos */

export function promos(token: string) {
  return request<AdminPromo[]>(token, "/admin/promos");
}

export function savePromo(token: string, body: Record<string, unknown>) {
  return request<AdminPromo>(token, "/admin/promos", { method: "POST", body });
}

export function deletePromo(token: string, code: string) {
  return request<void>(token, `/admin/promos/${encodeURIComponent(code)}`, { method: "DELETE" });
}

/* -------------------------------------------------------------- customers */

export function customers(token: string, query: { q?: string; page?: number }) {
  return request<Paginated<Customer>>(token, withQuery("/admin/customers", query));
}

/* ---------------------------------------------------------------- uploads */

/** The raw response, so a route handler can stream the file straight through. */
export async function downloadUpload(token: string, fileId: string): Promise<Response> {
  const response = await send(`/admin/uploads/${encodeURIComponent(fileId)}/download`, { token });
  if (response.status === 401 || response.status === 403) throw new AdminSessionEnded();
  if (!response.ok) throw await readError(response);
  return response;
}
