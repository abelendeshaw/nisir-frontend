"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { signup, type FormState } from "@/app/actions/auth";
import { TextField } from "@/components/forms/fields";
import { Magnetic } from "@/components/ui/magnetic";
import { Lines, Reveal } from "@/components/ui/reveal";

export function SignupView() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, undefined);

  return (
    <main id="main">
      <section className="slab-ink pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/" className="ul transition-colors hover:text-accent">
                Home
              </Link>
              <span className="text-faint">Create account</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[13ch]"
            lines={[
              <Fragment key="a">Keep a</Fragment>,
              <Fragment key="b">
                <span className="thin text-gold">record</span>.
              </Fragment>,
            ]}
          />

          <Reveal immediate delay={0.45}>
            <p className="lede mt-9 max-w-md">
              Orders placed while signed in stay attached to your account, not just this browser.
            </p>
          </Reveal>
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
            <div>
              <TextField name="name" label="Name" required placeholder="Your name" />
              {state?.errors?.name && <p className="mt-2 text-[13px] text-accent">{state.errors.name[0]}</p>}
            </div>

            <div>
              <TextField name="email" label="Email" type="email" required placeholder="you@example.com" />
              {state?.errors?.email && (
                <p className="mt-2 text-[13px] text-accent">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <TextField
                name="password"
                label="Password"
                type="password"
                required
                placeholder="At least 8 characters"
              />
              {state?.errors?.password && (
                <p className="mt-2 text-[13px] text-accent">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && <p className="text-[13px] text-accent">{state.message}</p>}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-6">
              <Magnetic strength={0.25}>
                <button type="submit" disabled={pending} className="btn btn-solid">
                  {pending ? "Creating account…" : "Create account"}
                </button>
              </Magnetic>
              <Link href="/account/login" className="tag-sm ul text-muted hover:text-accent">
                Already have one? Sign in
              </Link>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
