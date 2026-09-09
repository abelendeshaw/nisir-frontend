import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

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
 * The trade-off of a stateless session is the usual one: there is no server
 * side list of sessions to revoke. Logging out clears this browser's cookie;
 * it does not invalidate a copy of it elsewhere. Fine for now — this is the
 * same shape Next's own auth guide recommends for a first pass.
 */

export const COOKIE_NAME = "nisir_session";
const SESSION_LIFETIME = "7d";
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in " +
        "(openssl rand -base64 32).",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
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
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return { userId: payload.userId, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await encrypt(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
