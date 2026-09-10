"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { requestPasswordReset, type FormState } from "@/app/actions/auth";
import { TextField } from "@/components/forms/fields";
import { Magnetic } from "@/components/ui/magnetic";
import { Lines, Reveal } from "@/components/ui/reveal";

/**
 * Ask for a reset link.
 *
 * On success the form is replaced rather than left standing with a message
 * beside it — there is nothing useful to do here twice, and a second submit
 * only spends another of the five a minute the backend allows.
 *
 * The confirmation deliberately does not say whether that address had an
 * account. The backend refuses to distinguish the two so this endpoint cannot
 * be used to find out who shops here, and saying it here would give away
 * exactly what it withheld.
 */
export function ForgotPasswordView() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    requestPasswordReset,
    undefined,
  );

  return (
    <main id="main">
      <section className="slab-ink pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/account/login" className="ul transition-colors hover:text-accent">
                Sign in
              </Link>
              <span className="text-faint">Reset</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[13ch]"
            lines={[
              <Fragment key="a">Forgot your</Fragment>,
              <Fragment key="b">
                <span className="thin text-gold">password</span>.
              </Fragment>,
            ]}
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="shell max-w-md">
          {state?.sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6"
            >
              <p className="border-l-2 border-gold pl-4 text-[15px] leading-relaxed text-muted">
                If that address has an account, a reset link is on its way. It
                works once and stops working after an hour.
              </p>
              <p className="text-[13px] text-faint">
                Nothing arrived? Check spam, then{" "}
                <Link href="/account/forgot-password" className="ul hover:text-accent">
                  ask again
                </Link>
                .
              </p>
            </motion.div>
          ) : (
            <motion.form
              action={action}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              <p className="text-[15px] leading-relaxed text-muted">
                Give us the address on the account and we will send a link to
                choose a new password.
              </p>

              <div>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
                {state?.errors?.email && (
                  <p className="mt-2 text-[13px] text-accent">{state.errors.email[0]}</p>
                )}
              </div>

              {state?.message && <p className="text-[13px] text-accent">{state.message}</p>}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-6">
                <Magnetic strength={0.25}>
                  <button type="submit" disabled={pending} className="btn btn-solid">
                    {pending ? "Sending…" : "Send the link"}
                  </button>
                </Magnetic>
                <Link href="/account/login" className="tag-sm ul text-muted hover:text-accent">
                  Remembered it? Sign in
                </Link>
              </div>
            </motion.form>
          )}
        </div>
      </section>
    </main>
  );
}
