"use server";

import { redirect } from "next/navigation";
import { AuthError, loginRemote, revokeSessionRemote, signupRemote } from "@/lib/auth/backend";
import { getUser } from "@/lib/auth/dal";
import { createSession, deleteSession } from "@/lib/auth/session";

/**
 * Validation is deliberately minimal and hand-rolled — three fields, no
 * validation library — matching how the rest of the site's forms work
 * (`components/forms/fields.tsx`). The backend re-validates everything on its
 * side regardless; this layer exists to avoid a round trip for an obviously
 * empty or malformed field.
 */

export type FormState =
  | {
      errors?: { name?: string[]; email?: string[]; password?: string[] };
      message?: string;
    }
  | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: NonNullable<FormState>["errors"] = {};
  if (name.length < 1) errors.name = ["Enter your name."];
  if (!EMAIL_RE.test(email)) errors.email = ["Enter a valid email."];
  if (password.length < 8) errors.password = ["At least 8 characters."];
  if (Object.keys(errors).length > 0) return { errors };

  try {
    const user = await signupRemote({ name, email, password });
    await createSession({ userId: user.id, email: user.email, name: user.name, token: user.token });
  } catch (cause) {
    return { message: cause instanceof AuthError ? cause.message : "Something went wrong." };
  }

  redirect("/account");
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: NonNullable<FormState>["errors"] = {};
  if (!EMAIL_RE.test(email)) errors.email = ["Enter a valid email."];
  if (password.length < 1) errors.password = ["Enter your password."];
  if (Object.keys(errors).length > 0) return { errors };

  try {
    const user = await loginRemote({ email, password });
    await createSession({ userId: user.id, email: user.email, name: user.name, token: user.token });
  } catch (cause) {
    return { message: cause instanceof AuthError ? cause.message : "Something went wrong." };
  }

  redirect("/account");
}

/**
 * Signs out here and there.
 *
 * `deleteSession()` alone only forgets this browser's cookie, and the access
 * token inside it stays live on nisir-backend-php indefinitely — its
 * `sanctum.expiration` is null — so `verifiedUser()` would keep approving any
 * copy of that cookie taken from a shared machine. Revoking first is what
 * makes signing out mean something on both sides.
 *
 * Order matters: the remote call is best effort and never throws, but the
 * cookie is cleared afterwards regardless, so a customer who clicked "sign
 * out" is signed out of this browser whether or not the API answered.
 */
export async function logout(): Promise<void> {
  const session = await getUser();
  if (session) await revokeSessionRemote(session.token);

  await deleteSession();
  redirect("/");
}
