"use client";

import { type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Checkout fields are the same rule-and-label as `components/forms/fields.tsx`,
 * but controlled — the inquiry form only has to submit, while this one has to
 * validate a card number as it is typed and refuse to advance on a bad one.
 */

export function Field({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  className,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  hint?: ReactNode;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  className?: string;
  required?: boolean;
}) {
  const id = useId();

  return (
    <div className={cn("group relative min-w-0", className)}>
      <label
        htmlFor={id}
        className={cn(
          "tag-sm block transition-colors duration-300",
          error ? "text-accent" : "text-faint group-focus-within:text-accent",
        )}
      >
        {label}
        {!required && <span className="ml-2 normal-case tracking-normal text-faint">optional</span>}
      </label>
      <div className="relative mt-3">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-transparent pb-3 text-[15px] text-fg outline-none placeholder:text-faint"
        />
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px",
            error ? "bg-accent" : "bg-line",
          )}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-x-100" />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[12px] leading-snug text-accent">
          {error}
        </p>
      ) : (
        hint && <p className="mt-2 text-[12px] leading-snug text-faint">{hint}</p>
      )}
    </div>
  );
}

/** A choice made of full-width rows — delivery methods, payment methods. */
export function RadioRow({
  selected,
  onSelect,
  title,
  note,
  aside,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  note: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-5 border-2 px-5 py-4 text-left transition-colors duration-300",
        selected
          ? "border-accent"
          : "border-line hover:border-line-strong",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300",
          selected ? "border-accent" : "border-line-strong",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full bg-accent transition-transform duration-300",
            selected ? "scale-100" : "scale-0",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px]", selected ? "text-fg" : "text-muted")}>{title}</span>
        <span className="mt-1 block text-[12px] leading-snug text-faint">{note}</span>
      </span>
      {aside && <span className="shrink-0 text-[15px] tabular-nums text-fg">{aside}</span>}
    </button>
  );
}
