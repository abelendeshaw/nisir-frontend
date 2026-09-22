"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { login, type FormState } from "@/app/actions/auth";
import { AuthShell, Notice, Reasons } from "@/components/account/auth-shell";
import { GoogleButton } from "@/components/account/google-button";
import { PasswordField, TextField } from "@/components/forms/fields";
import { Magnetic } from "@/components/ui/magnetic";
import type { GoogleError } from "@/lib/auth/google";

/**
 * What went wrong with "Continue with Google", in the visitor's terms. The
 * reasons come from the API and `app/auth/google/complete/route.ts`.
 */
const GOOGLE_MESSAGES: Record<GoogleError, string> = {
  cancelled: "Google sign-in was cancelled. You can try again, or use your email below.",
  unverified:
    "Google hasn’t verified that email address, so we can’t use it to sign you in. Verify it with Google, or use your email and password below.",
  expired: "That Google sign-in took too long, or was started in a different browser. Try again.",
  unavailable: "Google sign-in isn’t available right now. Use your email and password below.",
  conflict:
    "That email address is already linked to a different Google account. Sign in with that one, or with your email and password.",
  failed: "Google sign-in didn’t work. Try again, or use your email and password below.",
};

/**
 * Sign in. `login` is a Server Action — the password crosses the wire once,
 * server to server, to nisir-backend; this component never sees the result
 * beyond "it worked" (a redirect) or a message to show.
 *
 * Three reasons somebody is looking at this form, and it says which:
 *
 *   expired  their session was cross-checked against the backend and found
 *            revoked. Worth stating plainly, because from where they sit a
 *            signed-in account page simply turned into a login form.
 *   reset    they have just changed their password and every device was
 *            signed out, this one included.
 *   next     the checkout gate stopped them, or `proxy.ts` did. Signing in
 *            returns them there rather than to the account page.
 */
export function LoginView({
  expired = false,
  reset = false,
  next,
  google = null,
}: {
  expired?: boolean;
  reset?: boolean;
  next?: string | null;
  /** Why a Google sign-in came back without a session, if one just did. */
  google?: GoogleError | null;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);

  const fromCheckout = next?.startsWith("/store/checkout") ?? false;

  return (
    <AuthShell
      crumb="Sign in"
      lines={[
        <Fragment key="a">Sign back</Fragment>,
        <Fragment key="b">
          <span className="thin text-gold">in</span>.
        </Fragment>,
      ]}
      lede={
        fromCheckout
          ? "Sign in to finish checking out. Your cart is held exactly as you left it."
          : "Your orders, your saved objects and your print status, wherever you signed in from."
      }
      aside={
        <Reasons
          items={[
            {
              title: "Orders and print status",
              detail: "Everything you have commissioned, and where each piece is in the queue.",
            },
            {
              title: "Saved objects",
              detail: "The pieces you set aside, on the account rather than in one browser.",
            },
          ]}
        />
      }
    >
      <motion.form
        action={action}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-8"
      >
        {next && <input type="hidden" name="next" value={next} />}

        {fromCheckout && !expired && (
          <Notice tone="gold">
            One step from checkout. Signing in takes you straight back to your cart.
          </Notice>
        )}

        {reset && (
          <Notice>
            Your password has been changed, and every other device has been signed out. Sign
            in with the new one.
          </Notice>
        )}

        {expired && (
          <Notice>
            That session has ended — you signed out somewhere else, or it was revoked. Sign in
            again to pick up where you left off.
          </Notice>
        )}

        {google && <Notice>{GOOGLE_MESSAGES[google]}</Notice>}

        <GoogleButton next={next} />

        <TextField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          error={state?.errors?.email?.[0]}
        />

        <PasswordField
          name="password"
          label="Password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
          error={state?.errors?.password?.[0]}
        />

        {state?.message && (
          <p role="alert" className="text-[13px] text-accent">
            {state.message}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
          <Magnetic strength={0.25}>
            <button type="submit" disabled={pending} className="btn btn-solid disabled:opacity-60">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </Magnetic>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={next ? `/account/signup?next=${encodeURIComponent(next)}` : "/account/signup"}
              className="tag-sm ul text-muted hover:text-accent"
            >
              New here? Create an account
            </Link>
            <Link href="/account/forgot-password" className="tag-sm ul text-faint hover:text-accent">
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.form>
    </AuthShell>
  );
}
