"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { signup, type FormState } from "@/app/actions/auth";
import { AuthShell, Notice, Reasons } from "@/components/account/auth-shell";
import { Checkbox, PasswordField, TextField } from "@/components/forms/fields";
import { Magnetic } from "@/components/ui/magnetic";

/**
 * Create an account.
 *
 * `next` is the page the visitor was trying to reach, already sanitised by
 * the route (see `lib/auth/next-path.ts`). It arrives set whenever the
 * checkout gate turned somebody around, which is now the most common way
 * anyone reaches this form — so the form says why they are here rather than
 * leaving them to work it out, and carries the destination through as a
 * hidden field for the Server Action to redirect to.
 */
export function SignupView({ next }: { next?: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, undefined);

  const fromCheckout = next?.startsWith("/store/checkout") ?? false;

  return (
    <AuthShell
      crumb="Create account"
      lines={[
        <Fragment key="a">Keep a</Fragment>,
        <Fragment key="b">
          <span className="thin text-gold">record</span>.
        </Fragment>,
      ]}
      lede={
        fromCheckout
          ? "Checkout runs against an account, so the order you are about to place stays findable — by you, and by us when you ask about it."
          : "Orders placed while signed in stay attached to your account, not just to this browser."
      }
      aside={
        <Reasons
          items={[
            {
              title: "Every order, kept",
              detail:
                "Receipts and print status live on the account. Clear this browser and they are still there.",
            },
            {
              title: "Saved objects follow you",
              detail:
                "The pieces you set aside belong to the account, not to one device's storage.",
            },
            {
              title: "Checkout already filled in",
              detail: "Your name and email carry over. You are asked once, not every time.",
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
        {/* Carried rather than remembered: a Server Action gets no access to
            the URL of the page that rendered its form. */}
        {next && <input type="hidden" name="next" value={next} />}

        {fromCheckout && (
          <Notice tone="gold">
            Your cart is waiting. Create an account and you will land straight back at
            checkout with it intact.
          </Notice>
        )}

        <TextField
          name="name"
          label="Name"
          required
          placeholder="Your name"
          autoComplete="name"
          autoFocus
          error={state?.errors?.name?.[0]}
        />

        <TextField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          error={state?.errors?.email?.[0]}
        />

        <PasswordField
          name="password"
          label="Password"
          required
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint="Eight characters or more. Longer beats stranger."
          error={state?.errors?.password?.[0]}
        />

        <Checkbox name="terms" required error={state?.errors?.terms?.[0]}>
          I agree to the{" "}
          <Link href="/legal/terms" className="ul text-fg hover:text-accent">
            Terms of Service
          </Link>{" "}
          and the{" "}
          <Link href="/legal/privacy" className="ul text-fg hover:text-accent">
            Privacy Policy
          </Link>
          .
        </Checkbox>

        {/* The action's own failure — an address already registered, an
            unreachable backend — rather than a field that did not validate. */}
        {state?.message && (
          <p role="alert" className="text-[13px] text-accent">
            {state.message}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Magnetic strength={0.25}>
            <button type="submit" disabled={pending} className="btn btn-solid disabled:opacity-60">
              {pending ? "Creating account…" : "Create account"}
            </button>
          </Magnetic>
          <Link
            href={next ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login"}
            className="tag-sm ul text-muted hover:text-accent"
          >
            Already have one? Sign in
          </Link>
        </div>
      </motion.form>
    </AuthShell>
  );
}
