"use server";

import { redirect } from "next/navigation";
import {
  AuthError,
  forgotPasswordRemote,
  loginRemote,
  resetPasswordRemote,
  revokeSessionRemote,
  signupRemote,
} from "@/lib/auth/backend";
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
      /** Set by `requestPasswordReset` so the form can swap itself for a note. */
      sent?: boolean;
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
 * Step one of a reset: ask for the email.
 *
 * Always reports success, even for an address with no account. The backend
 * refuses to distinguish the two on purpose, and undoing that here — "no such
 * account" — would hand back exactly the answer it withheld.
 */
export async function requestPasswordReset(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { errors: { email: ["Enter a valid email."] } };

  try {
    await forgotPasswordRemote(email);
  } catch (cause) {
    return { message: cause instanceof AuthError ? cause.message : "Something went wrong." };
  }

  return { sent: true };
}

/**
 * Step two: the token from the email, plus a new password.
 *
 * Signs nobody in on success. The backend revokes every access token the
 * account had as part of the reset, so there is nothing left to build a
 * session from — and asking someone to type the password they just chose is
 * the ordinary shape of this flow anyway.
 */
export async function resetPassword(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const errors: NonNullable<FormState>["errors"] = {};
  if (password.length < 8) errors.password = ["At least 8 characters."];
  // Checked here and nowhere else: the backend has no second field to compare
  // against, so a typo would otherwise become a password nobody knows.
  else if (password !== confirm) errors.password = ["Those two do not match."];
  if (Object.keys(errors).length > 0) return { errors };

  if (!token || !email) {
    return { message: "That reset link is incomplete. Ask for a new one." };
  }

  try {
    await resetPasswordRemote({ token, email, password });
  } catch (cause) {
    return { message: cause instanceof AuthError ? cause.message : "Something went wrong." };
  }

  redirect("/account/login?reset=1");
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
