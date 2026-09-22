import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The admin panel's building blocks.
 *
 * Same tokens as the storefront — bone, ink, gold, the one family — but set
 * for work rather than for reading: compact controls, tables, small type. The
 * storefront's display sizes and baseline fields are for a visitor browsing
 * one object at a time; this is for someone going through forty orders.
 */

export const control =
  "h-10 w-full border-2 border-line bg-transparent px-3 text-[14px] text-fg outline-none transition-colors duration-300 placeholder:text-faint focus:border-fg disabled:opacity-50";

export const button = {
  base: "inline-flex h-10 items-center justify-center gap-2 border-2 px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50",
  primary: "border-ink bg-ink text-bone hover:border-gold-deep hover:bg-gold-deep",
  ghost: "border-line-strong text-fg hover:border-fg",
  danger: "border-line-strong text-fg hover:border-[#9b2c2c] hover:text-[#9b2c2c]",
};

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-line pb-6">
      <div className="min-w-0">
        {eyebrow && <p className="marker tag-sm">{eyebrow}</p>}
        <h1 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold uppercase leading-none tracking-[-0.04em]">
          {title}
        </h1>
        {lede && <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-2 border-line bg-surface", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line px-5 py-3">
          {title && <h2 className="tag text-fg">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <p className="tag-sm text-faint">{label}</p>
      <p className="mt-3 text-[28px] font-extrabold tabular-nums leading-none tracking-[-0.03em] text-fg">{value}</p>
      {detail && <p className="mt-2 text-[12px] text-muted">{detail}</p>}
    </>
  );

  return href ? (
    <Link href={href} className="block border-2 border-line bg-surface p-5 transition-colors hover:border-fg">
      {body}
    </Link>
  ) : (
    <div className="border-2 border-line bg-surface p-5">{body}</div>
  );
}

/**
 * An order's status, as a word first and a style second — never colour
 * alone. Settled orders read solid, open ones outlined, and ones that will
 * not ship struck through.
 */
export function StatusBadge({ status, label }: { status: string; label: string }) {
  const style =
    status === "paid" || status === "fulfilled"
      ? "border-ink bg-ink text-bone"
      : status === "pending_payment"
        ? "border-gold-deep text-gold-deep"
        : "border-line-strong text-faint line-through";

  return <span className={cn("inline-flex border-2 px-2 py-1 tag-sm whitespace-nowrap", style)}>{label}</span>;
}

export function Flag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap",
        tone === "warn" ? "border-gold-deep text-gold-deep" : "border-line-strong text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border-2 border-dashed border-line px-5 py-10 text-center text-[14px] text-muted">{children}</p>;
}

export function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="tag-sm mb-2 block text-faint">
      {children}
    </label>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p role="alert" className="mt-1.5 text-[12px] leading-snug text-[#9b2c2c]">
      {messages[0]}
    </p>
  );
}

export function FormMessage({ state }: { state?: { ok?: boolean; message?: string } }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn("text-[13px] leading-snug", state.ok ? "text-gold-deep" : "text-[#9b2c2c]")}
    >
      {state.message}
    </p>
  );
}

/** A table that scrolls sideways on a phone rather than squashing its columns. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border-2 border-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("tag-sm border-b-2 border-line bg-surface px-4 py-3 font-semibold text-faint", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-line px-4 py-3 align-middle", className)}>{children}</td>;
}

export function Pagination({
  page,
  lastPage,
  total,
  href,
}: {
  page: number;
  lastPage: number;
  total: number;
  href: (page: number) => string;
}) {
  if (lastPage <= 1) {
    return <p className="mt-4 text-[12px] text-faint">{total} in total</p>;
  }

  return (
    <nav aria-label="Pages" className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <p className="text-[12px] text-faint">
        Page {page} of {lastPage} · {total} in total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={cn(button.base, button.ghost)}>
            Previous
          </Link>
        ) : (
          <span className={cn(button.base, button.ghost, "opacity-40")}>Previous</span>
        )}
        {page < lastPage ? (
          <Link href={href(page + 1)} className={cn(button.base, button.ghost)}>
            Next
          </Link>
        ) : (
          <span className={cn(button.base, button.ghost, "opacity-40")}>Next</span>
        )}
      </div>
    </nav>
  );
}

/** "3 hours ago" is less useful to an admin than a date they can quote on the phone. */
export function dateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
