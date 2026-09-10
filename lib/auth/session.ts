import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env";

/**
 * The session, signed rather than stored.
 *
 * nisir-backend owns passwords and the users table; this file never sees a
 * password or a database. A Server Action calls the backend once (see
 * `lib/auth/backend.ts`), gets back `{id, email, name}`, and that becomes the
 * entire payload of a signed cookie — no session row, no round trip to read
 * it back. That is also why the header can show "Signed in as …" on every
 * request without asking the backend anything: `getUser()` just decrypts what
 * is already in the request.
 *
 * The usual trade-off of a stateless session — nothing on the server to
 * revoke — is answered rather than accepted. The cookie carries the backend's
 * access token, and nisir-backend-php *does* keep a list of those, so
 * `verifiedUser()` in `dal.ts` cross-checks one against `GET /auth/session`
 * wherever a session actually guards something, and `logout()` revokes it
 * with `DELETE /auth/session`. A cookie whose token has been withdrawn stops
 * working within a request rather than at the end of its seven days.
 *
 * What is still true is that this file cannot revoke anything by itself.
 * Changing `SESSION_SECRET` invalidates every cookie at once; short of that,
 * the backend is the only thing that can end a session it did not issue.
 */

export const COOKIE_NAME = "nisir_session";
const SESSION_LIFETIME = "7d";
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

function secretKey() {
  // Presence, length and placeholder checks all happen in `lib/env.ts`, and
  // `instrumentation.ts` runs them at startup — by the time a request gets
  // here the secret is known good.
  return new TextEncoder().encode(serverEnv().SESSION_SECRET);
}

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  /**
   * The access token nisir-backend issued at login, carried inside this
   * cookie rather than in one of its own. Server Actions replay it as
   * `Authorization: Bearer` on the routes that need to know who is asking —
   * "my orders", and anything admin. The browser never sees it: this cookie
   * is httpOnly and only ever read on the server.
   */
  token: string;
};

export async function encrypt(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_LIFETIME)
    .sign(secretKey());
}

/** Never throws — a missing, expired or tampered cookie just isn't a session. */
export async function decrypt(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      // A cookie from before the backend issued tokens can't authenticate a
      // request, so it isn't a session any more. Signing in again fixes it.
      typeof payload.token !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      token: payload.token,
    };
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await encrypt(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: serverEnv().isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_LIFETIME_MS),
  });
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function readSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}
