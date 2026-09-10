import "server-only";

import { apiUrl } from "@/lib/env";

/**
 * The one door into nisir-backend for auth. Server Actions call these; the
 * browser never talks to the backend directly, and never sees `NISIR_API_URL`.
 *
 * Contract nisir-backend needs to implement — this file is written against
 * it, not against anything that exists yet (the backend, as of writing, has
 * a `users` reference slice with no password column and no `/auth` module):
 *
 *   POST   /auth/signup  { email, name, password } -> 201 { id, email, name, token }
 *                                                     409 if the email exists
 *   POST   /auth/login   { email, password }       -> 200 { id, email, name, token }
 *                                                     401 on bad credentials
 *   GET    /auth/session Bearer token              -> 200 { id, email, name }
 *                                                     401 if the token is dead
 *   DELETE /auth/session Bearer token              -> 204, token revoked
 *
 * Passwords are hashed on that side; this file only ever forwards the
 * plaintext once, server to server, and never stores it.
 *
 * `token` is a backend-signed access token. It goes into the session cookie
 * (see `session.ts`) and is replayed on the routes that need to know who is
 * asking — `GET /orders`, and anything admin.
 */

export class AuthError extends Error {}

type BackendUser = { id: string; email: string; name: string; token: string };

/**
 * Laravel's own sentence for a failure, when it has written one worth showing.
 *
 * A validation failure carries both `message` (already a readable summary of
 * the first problem) and `errors` keyed by field. The summary is the useful
 * half here, because these forms show one message rather than per-field text
 * from the server.
 */
async function readMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string" && body.message.trim() !== ""
      ? body.message
      : null;
  } catch {
    return null;
  }
}

async function call(path: string, body: unknown): Promise<BackendUser> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new AuthError("Can't reach the server right now. Try again in a moment.");
  }

  if (response.status === 409) {
    throw new AuthError("An account with that email already exists.");
  }
  if (response.status === 401) {
    throw new AuthError("That email or password doesn't match an account.");
  }

  // The backend rate-limits `/auth/*` at ten a minute per email-and-IP, which
  // is what stops someone working through a password list. Falling through to
  // the generic message below told the one person it is most likely to catch —
  // a customer mistyping their own password — that the server had broken, and
  // gave them no reason to wait rather than keep hammering it.
  if (response.status === 429) {
    const seconds = Number(response.headers.get("Retry-After"));
    throw new AuthError(
      Number.isFinite(seconds) && seconds > 0
        ? `Too many attempts. Try again in ${Math.ceil(seconds)} seconds.`
        : "Too many attempts. Wait a minute and try again.",
    );
  }

  // A 422 is this form disagreeing with the backend's rules, and the two are
  // not identical: the checks in `app/actions/auth.ts` are floors (an email
  // that looks like one, eight characters of password) while the backend also
  // has ceilings — 120 for a name, 200 for a password, 255 for an email. Only
  // the backend knows which one was crossed, and its sentence names the field.
  if (response.status === 422) {
    throw new AuthError(
      (await readMessage(response)) ?? "Check the details and try again.",
    );
  }

  if (!response.ok) {
    throw new AuthError("Something went wrong on our end. Try again in a moment.");
  }

  const data = (await response.json()) as Partial<BackendUser>;
  if (
    typeof data.id !== "string" ||
    typeof data.email !== "string" ||
    typeof data.name !== "string" ||
    typeof data.token !== "string"
  ) {
    throw new AuthError("The server sent back something unexpected.");
  }
  return { id: data.id, email: data.email, name: data.name, token: data.token };
}

export function signupRemote(fields: { email: string; name: string; password: string }) {
  return call("/auth/signup", fields);
}

export function loginRemote(fields: { email: string; password: string }) {
  return call("/auth/login", fields);
}

/* ------------------------------------------------------------------ session */

/**
 * What nisir-backend-php says about the token in a session cookie.
 *
 * Three outcomes, not two, because "the backend disowns this token" and "the
 * backend did not answer" have to lead to opposite decisions. A 401 is a fact
 * — the session is over. A timeout is not: treating one as a sign-out would
 * turn every hiccup on the API into a site-wide logout.
 */
export type SessionCheck =
  | { status: "valid"; user: { id: string; email: string; name: string } }
  | { status: "revoked" }
  | { status: "unreachable" };

/**
 * Cross-checks a session cookie's access token against the backend.
 *
 * The cookie is a JWT this app signs itself and never stores (see
 * `lib/auth/session.ts`), so on its own it keeps saying "signed in" for the
 * full seven days — after the customer signed out on another machine, after
 * an admin revoked the token, after the account was deleted. This asks the
 * one service that knows.
 *
 * `GET /auth/session` -> 200 { id, email, name }   token is live
 *                        401                       token is not
 */
export async function checkSessionRemote(token: string): Promise<SessionCheck> {
  let response: Response;
  try {
    response = await fetch(apiUrl("/auth/session"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { status: "unreachable" };
  }

  // The only two statuses that mean "this token is finished". Everything else
  // — 500, 502, a 429 from a limiter, a proxy's error page — is this service
  // failing to answer, and the caller keeps the session rather than punishing
  // a signed-in customer for the API's bad afternoon.
  if (response.status === 401 || response.status === 403) return { status: "revoked" };
  if (!response.ok) return { status: "unreachable" };

  let data: Partial<{ id: string; email: string; name: string }>;
  try {
    data = (await response.json()) as Partial<{ id: string; email: string; name: string }>;
  } catch {
    return { status: "unreachable" };
  }

  if (
    typeof data.id !== "string" ||
    typeof data.email !== "string" ||
    typeof data.name !== "string"
  ) {
    // Something answered on that URL, but it was not this contract. Not
    // grounds to sign anybody out.
    return { status: "unreachable" };
  }

  return { status: "valid", user: { id: data.id, email: data.email, name: data.name } };
}

/**
 * Revokes the access token on the backend, so signing out here also ends the
 * session there.
 *
 * Without this, `deleteSession()` only forgets this browser's cookie while
 * the token inside it stays valid on the backend forever, and the check
 * above would go on approving any copy of it. Best effort on purpose: a
 * customer who clicked "sign out" gets signed out of this browser whether or
 * not the API is reachable, which is the part they can see. The cost of the
 * unreachable case is a token that outlives its cookie — the same position
 * every session was in before this existed.
 */
export async function revokeSessionRemote(token: string): Promise<void> {
  try {
    await fetch(apiUrl("/auth/session"), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    // Deliberately swallowed — see above.
  }
}
