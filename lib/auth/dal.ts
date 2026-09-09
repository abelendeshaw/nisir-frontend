import "server-only";

import { cache } from "react";
import { decrypt, readSessionCookie, type SessionUser } from "./session";

/**
 * The one place that reads the session. Everything else — the account page,
 * the header, `proxy.ts` — goes through this rather than touching the cookie
 * directly, so there is exactly one definition of "signed in".
 *
 * Cached per request: a page, its layout and any server component in between
 * can all call `getUser()` without each one re-verifying the JWT.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = await readSessionCookie();
  return decrypt(token);
});
