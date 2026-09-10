import "server-only";

import { cache } from "react";
import { checkSessionRemote } from "./backend";
import { decrypt, readSessionCookie, type SessionUser } from "./session";

/**
 * The one place that reads the session. Everything else — the account page,
 * the header, `proxy.ts` — goes through this rather than touching the cookie
 * directly, so there is exactly one definition of "signed in".
 *
 * Two definitions, in fact, and the difference matters:
 *
 *   getUser()      the cookie's own word for it. A local JWT verify, no
 *                  network. Right for anything that only displays a name.
 *   verifiedUser() the same, cross-checked against nisir-backend-php. One
 *                  request. Right for anything that guards data.
 *
 * Both are cached per request, so a page, its layout and every server
 * component in between can call either without repeating the work.
 */

/**
 * Optimistic: what the cookie claims, verified only against `SESSION_SECRET`.
 *
 * Cheap enough for the root layout to await on every page — which is the
 * point, because the header needs a name and nothing else does. It is not a
 * security boundary: a cookie stays cryptographically perfect for its full
 * seven days after the backend has stopped honouring the token inside it.
 * Anything that gates data wants `verifiedUser()`.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = await readSessionCookie();
  return decrypt(token);
});

/**
 * The cookie, cross-checked with the service that actually owns the session.
 *
 * This is what closes the hole a stateless session leaves open. The cookie
 * proves only that this app signed it; nisir-backend-php is the one that
 * knows whether the access token inside it is still live, so a customer who
 * signed out on another machine, a revoked token, or a deleted account all
 * stop being a session here within one request rather than in seven days.
 *
 * Three answers, three behaviours:
 *
 *   valid       -> the session, with name and email refreshed from the
 *                  backend's copy, which is how a profile edited there
 *                  reaches a cookie that was signed days ago.
 *   revoked     -> null. The 401 is a fact, not a hiccup.
 *   unreachable -> the cookie's session, unchanged. Failing closed here would
 *                  mean any blip on the API signs out every customer at once,
 *                  which is a worse failure than briefly honouring a token
 *                  that has just been revoked.
 *
 * Callers that get null while `getUser()` returns a session are looking at a
 * cookie the backend has disowned; send them to `/account/login?expired=1`,
 * which is where `proxy.ts` clears it.
 */
export const verifiedUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getUser();
  if (!session) return null;

  const check = await checkSessionRemote(session.token);

  if (check.status === "revoked") return null;
  if (check.status === "unreachable") return session;

  // A token that resolves to a different account than the cookie names is not
  // a case with an innocent explanation — a recycled id, a crossed wire, a
  // forged payload. None of them should be served someone's orders.
  if (check.user.id !== session.userId) return null;

  return { ...session, email: check.user.email, name: check.user.name };
});
