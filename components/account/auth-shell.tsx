"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Lines, Reveal } from "@/components/ui/reveal";

/**
 * The frame both auth pages are set in.
 *
 * These two screens used to be a headline on an ink slab followed by a lone
 * column of fields on bone — correct, and the only part of the site that
 * looked like a form rather than a page. The rest of it is built from
 * full-bleed slabs with display type running to the margin, so that is what
 * this does too: one ink slab holding the full viewport, the argument for
 * having an account on the left, the fields on the right behind a vertical
 * rule.
 *
 * Ink rather than a bone panel on purpose. The header is fixed, transparent
 * at rest and sets its type in bone, on the stated assumption that "every
 * page opens on an ink slab" (see `components/chrome/header.tsx`) — a pale
 * panel at the top of this page would make the site's own navigation
 * invisible until the visitor scrolled. Keeping the slab ink also means the
 * fields inherit the right treatment for free: `slab-ink` re-points `--fg`,
 * `--line` and `--accent` at itself, so every control from
 * `components/forms/fields.tsx` comes out bone-on-ink with a gold focus rule
 * without being told.
 */
export function AuthShell({
  crumb,
  lines,
  lede,
  aside,
  children,
}: {
  /** Where this page sits, for the breadcrumb's second half. */
  crumb: string;
  /** The headline, one array entry per rendered line. */
  lines: ReactNode[];
  lede?: ReactNode;
  /** The argument for an account: reasons, reassurance, whatever fits. */
  aside?: ReactNode;
  /** The form. */
  children: ReactNode;
}) {
  return (
    <main id="main">
      <section className="slab-ink relative flex min-h-dvh flex-col justify-center pb-20 pt-[calc(var(--header-h)+clamp(40px,8vh,96px))]">
        {/* The page's own grid, shown faintly — the same texture the studio
            and services pages carry. */}
        <div className="grid-rails hidden lg:block" aria-hidden />

        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/" className="ul transition-colors hover:text-accent">
                Home
              </Link>
              <span className="text-faint">{crumb}</span>
            </p>
          </Reveal>

          <div className="mt-10 grid gap-x-20 gap-y-14 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:gap-x-28">
            <div className="flex flex-col">
              <Lines as="h1" immediate delay={0.12} className="d1 max-w-[12ch]" lines={lines} />

              {lede && (
                <Reveal immediate delay={0.4}>
                  <p className="lede mt-8 max-w-md">{lede}</p>
                </Reveal>
              )}

              {aside && (
                <Reveal immediate delay={0.5}>
                  <div className="mt-12 lg:mt-auto lg:pt-16">{aside}</div>
                </Reveal>
              )}
            </div>

            {/* The rule only appears once the columns are side by side; below
                that it would cut across the form's own baselines. */}
            <div className="lg:border-l lg:border-line lg:pl-20 xl:pl-28">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * The numbered reasons in the left column.
 *
 * Set like the rest of the site's lists — a gold index, a heading, a line of
 * explanation — rather than as ticks, which would read as a pricing table.
 */
export function Reasons({ items }: { items: { title: string; detail: string }[] }) {
  return (
    <ul className="flex flex-col gap-7">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-5">
          <span className="tag-sm mt-[3px] shrink-0 text-gold">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-[15px] font-semibold leading-snug">{item.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * A short, bordered aside at the top of a form — the reason the visitor is
 * looking at it when they did not ask to be.
 *
 * `tone` is the difference between "here is where you are" and "something
 * went wrong": gold for the checkout gate, which is the site working as
 * intended, and a plain rule for an expired session, which is not.
 */
export function Notice({
  tone = "plain",
  children,
}: {
  tone?: "plain" | "gold";
  children: ReactNode;
}) {
  return (
    <p
      className={
        tone === "gold"
          ? "border-l-2 border-gold bg-gold/5 py-3 pl-4 pr-3 text-[13px] leading-relaxed text-fg"
          : "border-l-2 border-line-strong pl-4 text-[13px] leading-relaxed text-muted"
      }
    >
      {children}
    </p>
  );
}
