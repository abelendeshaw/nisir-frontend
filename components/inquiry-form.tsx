"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TextAreaField, TextField } from "@/components/form-fields";
import { Magnetic } from "@/components/motion";

/**
 * Frontend-only inquiry form. Nothing is transmitted yet — submitting swaps
 * the form for a confirmation panel. Wire the handler to a route handler or
 * form action when the studio is ready to receive inquiries.
 */
export function InquiryForm({
  submitLabel,
  note = "No account needed for a service inquiry. This form is a prototype and does not send data yet.",
  children,
}: {
  submitLabel: string;
  note?: string;
  children?: ReactNode;
}) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card flex min-h-[420px] flex-col items-start justify-center gap-6 rounded-2xl p-10"
        >
          <span className="grid size-14 place-items-center rounded-full border border-accent/50 text-2xl text-accent">
            ✓
          </span>
          <div>
            <h3 className="display text-3xl md:text-4xl">Captured.</h3>
            <p className="mt-3 max-w-md text-muted">
              Your inquiry was captured in the prototype. Connect this form to a backend and it
              will reach the studio inbox.
            </p>
          </div>
          <button type="button" onClick={() => setSent(false)} className="btn">
            Send another ↗
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-x-8 gap-y-7 sm:grid-cols-2"
        >
          <TextField name="first_name" label="First name" autoComplete="given-name" />
          <TextField name="last_name" label="Last name" autoComplete="family-name" />
          <TextField name="email_address" label="Email address" type="email" autoComplete="email" />
          <TextField name="phone_number" label="Phone number" type="tel" autoComplete="tel" />

          {children}

          <TextAreaField
            name="project_description"
            label="Project description"
            placeholder="Tell us what you are trying to make, change, or solve."
            className="sm:col-span-2"
          />

          <div className="flex flex-col items-start gap-6 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-[11px] leading-relaxed text-subtle">{note}</p>
            <Magnetic>
              <button type="submit" className="btn btn-solid">
                {submitLabel}
              </button>
            </Magnetic>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
