"use client";

import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Magnetic } from "@/components/ui/magnetic";
import { TextArea, TextField } from "@/components/forms/fields";
import { site } from "@/lib/site";

const budgets = [
  "Under $5k",
  "$5k – $15k",
  "$15k – $40k",
  "$40k+",
  "Not sure yet",
];

/**
 * One inquiry shape, shared by the contact page and all seven service
 * pages. `children` is where a service drops in its own sharper questions,
 * between the identity block and the brief.
 */
export function InquiryForm({
  children,
  submitLabel = "Send inquiry",
  note,
}: {
  children?: ReactNode;
  submitLabel?: string;
  note?: string;
}) {
  const [sent, setSent] = useState(false);

  return (
    <div id="inquiry" className="relative">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="border border-line bg-surface p-10 md:p-14"
          >
            <p className="tag-sm text-accent">Received</p>
            <p className="d4 mt-6 max-w-[18ch]">Thank you — we&rsquo;ll be in touch.</p>
            <p className="lede mt-5 max-w-md">
              This form is a front-end prototype: nothing has actually been transmitted yet. Until
              the backend is wired up, send the same note to{" "}
              <a href={`mailto:${site.email}`} className="ul text-fg">
                {site.email}
              </a>{" "}
              and it will reach us.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="tag-sm ul mt-8 text-muted hover:text-fg"
            >
              Write another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
            className="grid gap-x-10 gap-y-9 sm:grid-cols-2"
          >
            <TextField name="name" label="Name" required placeholder="Your name" />
            <TextField name="email" label="Email" type="email" required placeholder="you@company.com" />
            <TextField name="organisation" label="Organisation" placeholder="Optional" />
            <SelectBudget />

            {children}

            <TextArea
              name="brief"
              label="What are you building?"
              required
              rows={5}
              placeholder="The problem, the audience, and what success looks like."
              className="sm:col-span-2"
            />

            <div className="flex flex-col gap-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <Magnetic strength={0.25}>
                <button type="submit" className="btn btn-solid">
                  {submitLabel}
                </button>
              </Magnetic>
              {note && <p className="max-w-sm text-[12px] leading-snug text-faint">{note}</p>}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectBudget() {
  return (
    <div className="group">
      <p className="tag-sm text-faint transition-colors duration-300 group-focus-within:text-accent">
        Budget range
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {budgets.map((budget) => (
          <label key={budget} className="cursor-pointer">
            <input type="radio" name="budget" value={budget} className="peer sr-only" />
            <span className="tag-sm inline-flex items-center rounded-full border border-line px-4 py-2.5 text-muted transition-colors duration-300 hover:border-line-strong peer-checked:border-accent peer-checked:text-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {budget}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
