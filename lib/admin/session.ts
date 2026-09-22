import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env";

/**
 * The admin panel's session — a separate cookie from the storefront's, and
 * deliberately harder to misuse.
 *
 * Same shape as `lib/auth/session.ts` (a signed JWT carrying the backend's
 * access token, never stored server-side), with four differences:
 *
 *   key       derived from SESSION_SECRET with an admin-only suffix, and the
 *             token names its audience. A storefront cookie will not verify
 *             here and this one will not verify there, so neither can be
 *             pasted into the other's slot.
 *   path      scoped to the admin path. The browser never sends this cookie
 *             anywhere else on the site — not to the storefront's pages, not
 *             to its Server Actions.
 *   sameSite  strict. A link from another site into the panel arrives
 *             signed out, which rules out cross-site request forgery against
 *             anything it can do.
 *   lifetime  the backend's admin token lifetime (a working day), carried
 *             in the login response, so the two expire together.
 */

export const ADMIN_COOKIE = "nisir_admin";
const AUDIENCE = "nisir-admin";

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  /** The backend's admin token. Replayed as a Bearer header; never sent to the browser. */
  token: string;
  /** Epoch milliseconds at which the backend stops honouring `token`. */
  expiresAt: number;
};

function secretKey() {
  return new TextEncoder().encode(`${serverEnv().SESSION_SECRET}:${AUDIENCE}`);
}

function cookiePath(): string {
  const base = serverEnv().ADMIN_PATH;
  // Callers only reach here with the panel enabled; `/` would be the wrong
  // answer, so an impossible path is the safe one.
  return base ? `/${base}` : "/__admin-disabled__";
}

export async function createAdminSession(session: AdminSession): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(session.expiresAt / 1000))
    .sign(secretKey());

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: serverEnv().isProduction,
    sameSite: "strict",
    path: cookiePath(),
    expires: new Date(session.expiresAt),
  });
}

/** Never throws — a missing, expired, tampered or foreign cookie just isn't a session. */
export async function readAdminSession(): Promise<AdminSession | null> {
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!raw) return null;

  try {
    const { payload } = await jwtVerify(raw, secretKey(), { algorithms: ["HS256"], audience: AUDIENCE });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.token !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      token: payload.token,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function deleteAdminSession(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: cookiePath() });
}
