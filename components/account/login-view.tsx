"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { login, type FormState } from "@/app/actions/auth";
import { TextField } from "@/components/forms/fields";
import { Magnetic } from "@/components/ui/magnetic";
import { Lines, Reveal } from "@/components/ui/reveal";

/**
 * Sign in. `login` is a Server Action — the password crosses the wire once,
 * server to server, to nisir-backend; this component never sees the result
 * beyond "it worked" (a redirect) or a message to show.
 *
 * `expired` says the visitor did not come here by choice: their session was
 * cross-checked against the backend and found revoked. Worth saying out loud,
 * because from where they sit a signed-in account page just turned into a
 * login form.
 */
export function LoginView({ expired = false }: { expired?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);

  return (
    <main id="main">
      <section className="slab-ink pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/" className="ul transition-colors hover:text-accent">
                Home
              </Link>
              <span className="text-faint">Sign in</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[13ch]"
            lines={[
              <Fragment key="a">Sign back</Fragment>,
              <Fragment key="b">
                <span className="thin text-gold">in</span>.
              </Fragment>,
            ]}
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="shell max-w-md">
          <motion.form
            action={action}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            {expired && (
              <p className="border-l-2 border-gold pl-4 text-[13px] leading-relaxed text-muted">
                That session has ended — you signed out somewhere else, or it was
                revoked. Sign in again to pick up where you left off.
              </p>
            )}

            <div>
              <TextField name="email" label="Email" type="email" required placeholder="you@example.com" />
              {state?.errors?.email && (
                <p className="mt-2 text-[13px] text-accent">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <TextField name="password" label="Password" type="password" required placeholder="••••••••" />
              {state?.errors?.password && (
                <p className="mt-2 text-[13px] text-accent">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && <p className="text-[13px] text-accent">{state.message}</p>}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-6">
              <Magnetic strength={0.25}>
                <button type="submit" disabled={pending} className="btn btn-solid">
                  {pending ? "Signing in…" : "Sign in"}
                </button>
              </Magnetic>
              <Link href="/account/signup" className="tag-sm ul text-muted hover:text-accent">
                New here? Create an account
              </Link>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
