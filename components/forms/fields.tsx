"use client";

import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fields are rules, not boxes.
 *
 * Every control is a baseline with a label above it; focus draws a gold line
 * across that baseline from the left. It keeps a long form reading as a
 * document rather than a stack of widgets, which is the only way seven
 * service forms can share one visual language.
 */

function Shell({
  label,
  htmlFor,
  hint,
  error,
  errorId,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  /** Rendered under the baseline and announced; see `TextField`. */
  error?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("group relative", className)}>
      <label htmlFor={htmlFor} className="tag-sm block text-faint transition-colors duration-300 group-focus-within:text-accent">
        {label}
      </label>
      <div className="relative mt-3">
        {children}
        {/*
          The baseline, and the line that draws over it. A field in error
          keeps its accent line permanently drawn rather than only on focus,
          so the fault is visible while the eye is somewhere else on the form.
        */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            error ? "scale-x-100" : "scale-x-0 group-focus-within:scale-x-100",
          )}
        />
      </div>
      {hint && !error && <p className="mt-2 text-[12px] leading-snug text-faint">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[13px] leading-snug text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full bg-transparent pb-3 text-[15px] text-fg outline-none placeholder:text-faint";

export function TextField({
  name,
  label,
  type = "text",
  required,
  placeholder,
  className,
  hint,
  error,
  autoComplete,
  defaultValue,
  autoFocus,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  hint?: string;
  /**
   * The server's complaint about this field, if it made one.
   *
   * Rendered by `Shell` and wired to the input with `aria-describedby`, so a
   * screen reader reaching a field hears why it was rejected instead of
   * finding the reason orphaned in the markup after it.
   */
  error?: string;
  autoComplete?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Shell label={label} htmlFor={id} hint={hint} error={error} errorId={errorId} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={control}
      />
    </Shell>
  );
}

/**
 * A password, with the option of reading it back.
 *
 * The toggle is not a flourish. These forms ask for eight characters minimum
 * and then hide every one of them, and a mistyped password on a signup form
 * becomes an account whose owner cannot get back in. `autoComplete` is
 * explicit for the same reason — `new-password` invites a manager to generate
 * and store one, `current-password` invites it to fill one in, and the
 * default guess between those two is frequently wrong.
 */
export function PasswordField({
  name,
  label,
  required,
  placeholder,
  className,
  hint,
  error,
  autoComplete = "current-password",
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  hint?: string;
  error?: string;
  autoComplete?: "current-password" | "new-password";
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [shown, setShown] = useState(false);

  return (
    <Shell label={label} htmlFor={id} hint={hint} error={error} errorId={errorId} className={className}>
      <input
        id={id}
        name={name}
        type={shown ? "text" : "password"}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(control, "pr-14")}
      />
      <button
        type="button"
        onClick={() => setShown((was) => !was)}
        // Announced rather than implied by an icon, and taken out of the tab
        // order's way of the submit button it sits beside.
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="tag-sm absolute bottom-3 right-0 text-faint transition-colors duration-300 hover:text-accent focus-visible:text-accent"
      >
        {shown ? "Hide" : "Show"}
      </button>
    </Shell>
  );
}

/**
 * A single checkbox with prose beside it — the terms acceptance, mostly.
 *
 * Not built on `Shell`: a rule under a line of small print reads as a field
 * that failed to get its label, and the control belongs inline with the
 * sentence it agrees to rather than under a heading of its own. The native
 * input is kept and styled with `accent-color` rather than replaced with a
 * div, so it stays keyboard operable and announces its own state.
 */
export function Checkbox({
  name,
  children,
  required,
  error,
  defaultChecked,
  className,
}: {
  name: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <span className="relative mt-[3px] inline-flex shrink-0">
          <input
            id={id}
            name={name}
            type="checkbox"
            required={required}
            defaultChecked={defaultChecked}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="peer size-4 cursor-pointer appearance-none border border-line-strong bg-transparent transition-colors duration-300 checked:border-accent checked:bg-accent hover:border-accent"
          />
          {/*
            The tick is a sibling, not a pseudo-element: `::after` on an
            `input` is not rendered in every engine, so a box drawn that way
            reads as filled-or-empty with no mark in it. Stroked in `--bg` so
            it stays legible against the accent fill on whichever slab this
            lands on.
          */}
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className="pointer-events-none absolute inset-0 size-4 scale-50 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-checked:scale-100 peer-checked:opacity-100"
          >
            <path
              d="M3.5 8.25 6.5 11.25 12.5 4.75"
              fill="none"
              stroke="var(--bg)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <label htmlFor={id} className="cursor-pointer text-[13px] leading-relaxed text-muted">
          {children}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[13px] leading-snug text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  name,
  label,
  required,
  placeholder,
  rows = 4,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={cn(control, "resize-none")}
      />
    </Shell>
  );
}

export function SelectField({
  name,
  label,
  options,
  className,
}: {
  name: string;
  label: string;
  options: readonly string[];
  className?: string;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <select id={id} name={name} className={cn(control, "cursor-pointer appearance-none pr-8")}>
        {options.map((option) => (
          <option key={option} value={option} className="bg-bg text-fg">
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute bottom-4 right-0 text-[10px] text-faint" aria-hidden>
        ▾
      </span>
    </Shell>
  );
}

export function NumberField({
  name,
  label,
  className,
  min = 1,
}: {
  name: string;
  label: string;
  className?: string;
  min?: number;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <input id={id} name={name} type="number" min={min} placeholder="1" className={control} />
    </Shell>
  );
}

/** Width / height / depth with a unit, on one baseline. */
export function DimensionsField({ className }: { className?: string }) {
  return (
    <div className={cn("group", className)}>
      <p className="tag-sm text-faint transition-colors duration-300 group-focus-within:text-accent">
        Approximate dimensions
      </p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { name: "width", label: "W" },
            { name: "height", label: "H" },
            { name: "depth", label: "D" },
          ] as const
        ).map((axis) => (
          <div key={axis.name} className="relative flex items-baseline gap-2">
            <span className="tag-sm text-faint">{axis.label}</span>
            <input
              name={axis.name}
              type="number"
              min={0}
              placeholder="0"
              aria-label={`${axis.label} dimension`}
              className={cn(control, "pb-2")}
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
          </div>
        ))}
        <div className="relative">
          <select
            name="unit"
            aria-label="Unit"
            className={cn(control, "cursor-pointer appearance-none pb-2")}
            defaultValue="mm"
          >
            {["mm", "cm", "in"].map((unit) => (
              <option key={unit} value={unit} className="bg-bg text-fg">
                {unit}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
        </div>
      </div>
    </div>
  );
}

/** Reference files, with the size limit enforced before anything is sent. */
export function FileField({
  name,
  label,
  accept,
  hint,
  maxBytes,
  className,
}: {
  name: string;
  label: string;
  accept: string;
  hint: string;
  maxBytes: number;
  className?: string;
}) {
  const id = useId();
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  function take(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    const tooBig = picked.find((file) => file.size > maxBytes);
    if (tooBig) {
      setError(`${tooBig.name} is over the ${Math.round(maxBytes / 1_048_576)}MB limit.`);
      setFiles([]);
      return;
    }
    setError(null);
    setFiles(picked.map((file) => `${file.name} · ${(file.size / 1_048_576).toFixed(1)}MB`));
  }

  return (
    <div className={className}>
      <p className="tag-sm text-faint">{label}</p>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          take(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex cursor-pointer flex-col items-start gap-2 border border-dashed p-6 transition-colors duration-300",
          over ? "border-accent bg-accent/5" : "border-line hover:border-line-strong",
        )}
      >
        <span className="text-[15px] text-fg">
          Drop files here, or <span className="text-accent underline underline-offset-4">browse</span>
        </span>
        <span className="text-[12px] leading-snug text-faint">{hint}</span>
        <input
          id={id}
          name={name}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(event) => take(event.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {files.map((file) => (
            <li key={file} className="tag-sm text-muted">
              ✓ {file}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-[13px] text-accent">{error}</p>}
    </div>
  );
}
