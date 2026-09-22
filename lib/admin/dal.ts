import "server-only";

import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { serverEnv } from "@/lib/env";
import { AdminApiError, AdminSessionEnded, adminSession } from "./api";
import { readAdminSession, type AdminSession } from "./session";

/**
 * The admin guard. Every admin page and every admin Server Action goes
 * through here; nothing in the panel reads the cookie or the path itself.
 *
 * Three layers, each of which alone is enough to keep someone out:
 *
 *   1. The path. The panel exists only at `/<ADMIN_PATH>`; every other value
 *      of that segment is the site's ordinary 404, so the panel cannot be
 *      found by guessing `/admin`. See `lib/env.ts`.
 *   2. The cookie. A signed, path-scoped, same-site-strict session minted
 *      only by the admin login. See `./session.ts`.
 *   3. The backend. The token inside that cookie is checked with
 *      nisir-backend-php on every page, which accepts only admin tokens held
 *      by current admins. This is the one that actually matters — the first
 *      two keep strangers from ever reaching it.
 */

export type AdminContext = {
  /** The admin path segment, without slashes. */
  base: string;
  session: AdminSession;
};

/**
 * Whether a URL segment is the admin path. Compared in constant time — the
 * path is not the lock, but there is no reason to leak it a character at a
 * time either.
 */
export function isAdminPath(segment: string): boolean {
  const expected = serverEnv().ADMIN_PATH;
  if (!expected || segment.length !== expected.length) return false;

  let difference = 0;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected.charCodeAt(i) ^ segment.charCodeAt(i);
  }
  return difference === 0;
}

/** The panel's base path. 404s when the panel is switched off. */
export function adminBase(): string {
  const base = serverEnv().ADMIN_PATH;
  if (!base) notFound();
  return base;
}

/** `/<ADMIN_PATH>/orders` from `/orders`. */
export function adminHref(path = ""): string {
  return `/${adminBase()}${path}`;
}

/**
 * The guard for a page: right path, live session, confirmed by the backend.
 *
 * Takes the page's `admin` param rather than trusting the layout to have
 * checked it — layouts are not re-rendered on every navigation, so a check
 * that lives only there is a check some requests skip.
 *
 * Cached per request, so the layout and the page share one backend check.
 */
export const requireAdmin = cache(async (segment: string): Promise<AdminContext> => {
  if (!isAdminPath(segment)) notFound();
  const base = adminBase();

  const session = await readAdminSession();
  if (!session) redirect(`/${base}/login`);

  try {
    const confirmed = await adminSession(session.token);
    // A token that resolves to someone other than the cookie's named admin
    // has no innocent explanation.
    if (confirmed.id !== session.userId) redirect(`/${base}/login?expired=1`);

    return { base, session: { ...session, name: confirmed.name, email: confirmed.email } };
  } catch (cause) {
    if (cause instanceof AdminSessionEnded) redirect(`/${base}/login?expired=1`);
    // Anything else — the API down, a 500 — propagates to the panel's error
    // boundary. Failing closed: an unconfirmed session shows nothing.
    throw cause;
  }
});

/**
 * Loads a page's data with the admin token. An ended session goes back to
 * the login form; a record the API has never heard of is this site's 404.
 */
export async function adminData<T>(context: AdminContext, load: (token: string) => Promise<T>): Promise<T> {
  try {
    return await load(context.session.token);
  } catch (cause) {
    if (cause instanceof AdminSessionEnded) redirect(`/${context.base}/login?expired=1`);
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    throw cause;
  }
}

/**
 * A page's `generateMetadata`: its title under the admin path, and nothing
 * anywhere else. A static `metadata` export would title the 404 that a wrong
 * guess at the path gets — "Orders", on a page that is meant to be
 * indistinguishable from any other missing page.
 */
export function adminTitle(title: string) {
  return async ({ params }: { params: Promise<{ admin: string }> }): Promise<Metadata> =>
    isAdminPath((await params).admin) ? { title } : {};
}

/**
 * The guard for a Server Action: the panel enabled and a session cookie
 * present. The backend then checks the token itself on the call the action
 * makes, so there is no need to spend a second request confirming it first —
 * and an action handed an ended session redirects to the login form through
 * `AdminSessionEnded`, the same as a page would.
 */
export async function requireAdminToken(): Promise<{ base: string; token: string }> {
  const base = adminBase();
  const session = await readAdminSession();
  if (!session) redirect(`/${base}/login?expired=1`);
  return { base, token: session.token };
}
