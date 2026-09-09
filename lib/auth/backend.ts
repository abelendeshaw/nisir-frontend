import "server-only";

/**
 * The one door into nisir-backend for auth. Server Actions call these; the
 * browser never talks to the backend directly, and never sees `NISIR_API_URL`.
 *
 * Contract nisir-backend needs to implement — this file is written against
 * it, not against anything that exists yet (the backend, as of writing, has
 * a `users` reference slice with no password column and no `/auth` module):
 *
 *   POST /auth/signup  { email, name, password }  -> 201 { id, email, name, token }
 *                                                     409 if the email exists
 *   POST /auth/login   { email, password }        -> 200 { id, email, name, token }
 *                                                     401 on bad credentials
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

function apiUrl(path: string): string {
  const base = process.env.NISIR_API_URL;
  if (!base) {
    throw new AuthError("NISIR_API_URL is not set — copy .env.example to .env.local.");
  }
  return new URL(path, base).toString();
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
