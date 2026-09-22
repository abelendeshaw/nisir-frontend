import "server-only";

import { safeNext } from "./next-path";

/**
 * The storefront's half of "Continue with Google".
 *
 *   /auth/google            sets a nonce cookie and sends the browser to
 *                           nisir-backend-php, which sends it on to Google
 *   /auth/google/complete   the browser, back from Google via the API, with
 *                           a one-time code; traded for a session with the
 *                           nonce from that cookie
 *
 * The cookie is what ties the two ends to one browser. The API seals the
 * nonce into the state Google carries, and will only redeem a code alongside
 * the nonce it was issued against — so a code copied into another browser, or
 * planted in a victim's to sign them in as someone else, finds no matching
 * cookie there and signs nobody in.
 */

export const GOOGLE_COOKIE = "nisir_google";

/** Only the two routes above ever receive the cookie. */
export const GOOGLE_COOKIE_PATH = "/auth/google";

/** Ten minutes to get through Google's screens — the same as the API's state. */
export const GOOGLE_COOKIE_SECONDS = 600;

/** Why a Google sign-in came back without a session. The login page explains each. */
export const GOOGLE_ERRORS = ["cancelled", "unverified", "expired", "unavailable", "conflict", "failed"] as const;
export type GoogleError = (typeof GOOGLE_ERRORS)[number];

export function isGoogleError(value: unknown): value is GoogleError {
  return typeof value === "string" && (GOOGLE_ERRORS as readonly string[]).includes(value);
}

export type GoogleStart = { nonce: string; next: string | null };

/** 32 random bytes, URL-safe — the shape the API's `TOKEN_PATTERN` expects. */
export function newNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}

/** The cookie's contents, or null if it is missing or not ours. `next` is re-sanitised on the way out. */
export function readGoogleStart(raw: string | undefined): GoogleStart | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GoogleStart>;
    if (typeof parsed.nonce !== "string" || !/^[A-Za-z0-9_-]{32,128}$/.test(parsed.nonce)) return null;
    return { nonce: parsed.nonce, next: safeNext(parsed.next) };
  } catch {
    return null;
  }
}
