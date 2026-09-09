"use client";

import { type ReactNode, useState } from "react";
import { motion } from "motion/react";
import { money, moneyExact } from "@/lib/shop/format";
import { resolvePromo, zoneById, type Promo, type Totals, type ZoneId } from "@/lib/shop/pricing";
import { usePromoCode } from "@/lib/shop/store";
import { cn } from "@/lib/utils";

/**
 * The running total. One component for the cart and the checkout, so the
 * arithmetic a shopper agrees to is rendered by the same code that renders the
 * arithmetic they were shown a screen earlier.
 */
export function Summary({
  totals,
  promo,
  shippingLabel,
  zone,
  /** Before an address exists, shipping and tax are estimates and say so. */
  estimated = false,
  children,
}: {
  totals: Totals;
  promo: Promo | null;
  shippingLabel?: string;
  zone?: ZoneId;
  estimated?: boolean;
  children?: ReactNode;
}) {
  const zoneRow = zone ? zoneById.get(zone) : null;

  return (
    <div className="border-2 border-line bg-surface p-7 md:p-8">
      <p className="tag-sm text-faint">Summary</p>

      <dl className="mt-7 flex flex-col gap-4">
        <Row label={`Subtotal — ${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`}>
          {money(totals.subtotalCents)}
        </Row>

        {totals.discountCents > 0 && (
          <Row label={promo ? promo.label : "Discount"} accent>
            −{money(totals.discountCents)}
          </Row>
        )}

        <Row
          label={
            totals.digitalOnly ? "Delivery — digital" : shippingLabel ?? "Shipping"
          }
          muted={totals.shippingCents === 0}
        >
          {totals.digitalOnly
            ? "By email"
            : totals.shippingCents === 0
              ? "Free"
              : money(totals.shippingCents)}
        </Row>

        <Row label={estimated ? `${totals.taxLabel} — estimated` : totals.taxLabel}>
          {money(totals.taxCents)}
        </Row>
      </dl>

      {totals.freeShippingGapCents > 0 && zoneRow?.freeOver && (
        <FreeShippingRail gap={totals.freeShippingGapCents} threshold={zoneRow.freeOver} />
      )}

      <div className="mt-7 flex items-baseline justify-between gap-4 border-t-2 border-line pt-6">
        <p className="text-[15px] text-fg">Total</p>
        <p className="d4 tabular-nums text-fg">
          {moneyExact(totals.totalCents)}
          <span className="tag-sm ml-2.5 align-middle text-faint">CAD</span>
        </p>
      </div>

      {children && <div className="mt-7 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

function Row({
  label,
  children,
  accent = false,
  muted = false,
}: {
  label: string;
  children: ReactNode;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd
        className={cn(
          "shrink-0 text-[14px] tabular-nums",
          accent ? "text-accent" : muted ? "text-muted" : "text-fg",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/** How far off free shipping is, as a bar rather than a sentence. */
function FreeShippingRail({ gap, threshold }: { gap: number; threshold: number }) {
  const progress = Math.max(0, Math.min(1, (threshold - gap) / threshold));
  return (
    <div className="mt-7">
      <p className="tag-sm text-faint">
        <span className="text-accent">{money(gap)}</span> from free shipping
      </p>
      <div className="mt-3 h-0.5 w-full overflow-hidden bg-line">
        <motion.div
          className="h-full bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/**
 * The code field. Applied codes live in their own store so a code entered in
 * the cart is still applied at checkout — a total that grows between screens
 * is the fastest way to lose an order.
 */
export function PromoField({ subtotalCents }: { subtotalCents: number }) {
  const [code, setCode] = usePromoCode();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const applied = code ? resolvePromo(code, subtotalCents) : null;

  if (applied?.ok) {
    return (
      <div className="flex items-center justify-between gap-4 border-2 border-accent px-5 py-4">
        <p className="min-w-0">
          <span className="tag-sm text-accent">{applied.promo.code}</span>
          <span className="mt-1 block text-[12px] leading-snug text-muted">
            {applied.promo.label}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setCode("");
            setDraft("");
          }}
          className="tag-sm ul shrink-0 text-faint transition-colors hover:text-fg"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const result = resolvePromo(draft, subtotalCents);
        if (result.ok) {
          setCode(result.promo.code);
          setError(null);
        } else {
          setError(result.reason);
        }
      }}
      className="group"
    >
      <label htmlFor="promo" className="tag-sm block text-faint group-focus-within:text-accent">
        Discount code
      </label>
      <div className="relative mt-3 flex items-baseline gap-4">
        <input
          id="promo"
          name="promo"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="MESKEL15"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent pb-3 text-[15px] uppercase tracking-[0.08em] text-fg outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-faint"
        />
        <button type="submit" className="tag-sm ul shrink-0 pb-3 text-muted hover:text-accent">
          Apply
        </button>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-x-100" />
      </div>
      {(error ?? (applied && !applied.ok ? applied.reason : null)) && (
        <p className="mt-3 text-[12px] text-accent">
          {error ?? (applied && !applied.ok ? applied.reason : null)}
        </p>
      )}
    </form>
  );
}

/** Resolves the stored code against a subtotal. Null when it no longer holds. */
export function useAppliedPromo(subtotalCents: number): Promo | null {
  const [code] = usePromoCode();
  if (!code) return null;
  const result = resolvePromo(code, subtotalCents);
  return result.ok ? result.promo : null;
}
