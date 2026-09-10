"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { resetPassword, type FormState } from "@/app/actions/auth";
import { TextField } from "@/components/forms/fields";
import { Magnetic } from "@/components/ui/magnetic";
import { Lines, Reveal } from "@/components/ui/reveal";

/**
 * Choose a new password, using the token from the email.
 *
 * `token` and `email` ride in hidden fields rather than being read from the
 * URL by this component, so the Server Action gets them from the form post
 * and never has to trust the client's idea of the current location.
 *
 * A link that arrives without both is dead on arrival — the page says so
 * rather than showing a form that can only fail once it is filled in.
 */
export function ResetPasswordView({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    resetPassword,
    undefined,
  );

  const usable = token !== "" && email !== "";

  return (
    <main id="main">
      <section className="slab-ink pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/account/login" className="ul transition-colors hover:text-accent">
                Sign in
              </Link>
              <span className="text-faint">New password</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[13ch]"
            lines={[
              <Fragment key="a">Choose a new</Fragment>,
              <Fragment key="b">
                <span className="thin text-gold">password</span>.
              </Fragment>,
            ]}
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="shell max-w-md">
          {!usable ? (
            <div className="flex flex-col gap-6">
              <p className="border-l-2 border-accent pl-4 text-[15px] leading-relaxed text-muted">
                This link is incomplete — it is missing the part that proves it
                came from us. Copy it from the email in full, or ask for a new one.
              </p>
              <Link href="/account/forgot-password" className="tag-sm ul text-muted hover:text-accent">
                Send me another link
              </Link>
            </div>
          ) : (
            <motion.form
              action={action}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="email" value={email} />

              <p className="text-[15px] leading-relaxed text-muted">
                Setting a new password for <span className="text-fg">{email}</span>.
                Every device currently signed in to this account will be signed out.
              </p>

              <div>
                <TextField
                  name="password"
                  label="New password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
                {state?.errors?.password && (
                  <p className="mt-2 text-[13px] text-accent">{state.errors.password[0]}</p>
                )}
              </div>

              <div>
                <TextField
                  name="confirm"
                  label="Type it again"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>

              {state?.message && <p className="text-[13px] text-accent">{state.message}</p>}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-6">
                <Magnetic strength={0.25}>
                  <button type="submit" disabled={pending} className="btn btn-solid">
                    {pending ? "Saving…" : "Save the password"}
                  </button>
                </Magnetic>
                <Link href="/account/forgot-password" className="tag-sm ul text-muted hover:text-accent">
                  Link expired? Ask again
                </Link>
              </div>
            </motion.form>
          )}
        </div>
      </section>
    </main>
  );
}
