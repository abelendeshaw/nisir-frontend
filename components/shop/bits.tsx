"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useWishlist } from "@/lib/shop/store";
import { cn } from "@/lib/utils";

/**
 * The small parts the storefront repeats: a quantity stepper, an option chip,
 * a saved-object toggle, an empty state. Same rule as the forms — a control is
 * a rule and a label, never a box with a shadow.
 */

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  compact = false,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label: string;
  compact?: boolean;
}) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <div
      className={cn(
        "inline-flex items-center border-2 border-line",
        compact ? "h-9" : "h-12",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= min}
        aria-label={`Fewer — ${label}`}
        className={cn(
          "grid h-full place-items-center text-fg transition-colors duration-300 hover:bg-fg hover:text-bg disabled:pointer-events-none disabled:text-faint",
          compact ? "w-8" : "w-11",
        )}
      >
        −
      </button>
      <span
        className={cn(
          "grid h-full place-items-center border-x-2 border-line tabular-nums",
          compact ? "w-9 text-[13px]" : "w-12 text-[15px]",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= max}
        aria-label={`More — ${label}`}
        className={cn(
          "grid h-full place-items-center text-fg transition-colors duration-300 hover:bg-fg hover:text-bg disabled:pointer-events-none disabled:text-faint",
          compact ? "w-8" : "w-11",
        )}
      >
        +
      </button>
    </div>
  );
}

export function OptionGroup({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="tag-sm flex w-full items-baseline justify-between gap-4 text-faint">
        <span>{label}</span>
        {hint && <span className="text-accent">{hint}</span>}
      </legend>
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  note,
  swatch,
  disabled,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  note?: ReactNode;
  swatch?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group/chip relative flex w-full items-center gap-3 border-2 px-4 py-3 text-left transition-colors duration-300",
        selected
          ? "border-accent text-fg"
          : "border-line text-muted hover:border-line-strong hover:text-fg",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      {swatch && (
        <span
          aria-hidden
          className="mt-0.5 size-3.5 shrink-0 rounded-full border border-line-strong"
          style={{ background: swatch }}
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-tight text-current">{children}</span>
        {note && <span className="mt-1 block text-[12px] leading-snug text-faint">{note}</span>}
      </span>
      {selected && (
        <motion.span
          className="tag-sm shrink-0 text-accent"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          ●
        </motion.span>
      )}
    </button>
  );
}

/** Saved objects. A hollow diamond fills when the object is kept. */
export function SaveButton({
  slug,
  className,
  withLabel = false,
}: {
  slug: string;
  className?: string;
  withLabel?: boolean;
}) {
  const wishlist = useWishlist();
  const saved = wishlist.has(slug);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        wishlist.toggle(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      className={cn(
        "group/save inline-flex items-center gap-3 transition-colors duration-300",
        saved ? "text-accent" : "text-faint hover:text-fg",
        className,
      )}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="size-4 shrink-0"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        animate={saved ? { rotate: [0, -12, 0], scale: [1, 1.22, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      >
        <path d="M12 2 L22 12 L12 22 L2 12 Z" />
      </motion.svg>
      {withLabel && <span className="tag-sm">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}

export function Empty({
  eyebrow,
  title,
  body,
  href = "/store",
  action = "Browse the shop",
}: {
  eyebrow: string;
  title: ReactNode;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="border-2 border-dashed border-line px-8 py-20 text-center md:py-28">
      <p className="tag-sm text-accent">{eyebrow}</p>
      <p className="d3 mx-auto mt-6 max-w-[16ch]">{title}</p>
      <p className="lede mx-auto mt-6 max-w-md">{body}</p>
      <Link href={href} className="btn mt-10">
        {action}
      </Link>
    </div>
  );
}

/**
 * A range control. The value is a rule with a readout above it, which is the
 * same grammar as every other field on the site — the browser's own thumb is
 * left alone because a hand-built one loses keyboard and touch behaviour.
 */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  hint,
  className,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="tag-sm text-faint">{label}</span>
        <span className="text-[14px] tabular-nums text-fg">{format(value)}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
      />
      {hint && <p className="mt-3 text-[12px] leading-snug text-faint">{hint}</p>}
    </div>
  );
}

/** A label over a figure. Used across specs, receipts and the quote panel. */
export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="tag-sm text-faint">{label}</p>
      <p className="mt-2 text-[15px] tabular-nums text-fg">{value}</p>
    </div>
  );
}

/** Feedback that a thing happened, without a toast library. */
export function Flash({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <motion.p
      className="tag-sm text-accent"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-live="polite"
    >
      {children}
    </motion.p>
  );
}
