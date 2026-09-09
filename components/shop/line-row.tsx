"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Relic } from "@/components/shop/relic";
import { Stepper } from "@/components/shop/bits";
import { money } from "@/lib/shop/format";
import { lineTotal, type CartLine } from "@/lib/shop/pricing";
import { cn } from "@/lib/utils";

/**
 * One line, wherever a cart is shown — the drawer, the cart page, the checkout
 * rail, the receipt. `variant` decides how much of it is interactive, so all
 * four stay literally the same component and can never drift apart.
 */
export function LineRow({
  line,
  variant = "full",
  onQty,
  onRemove,
}: {
  line: CartLine;
  variant?: "full" | "compact" | "static";
  onQty?: (qty: number) => void;
  onRemove?: () => void;
}) {
  const editable = variant !== "static" && !!onQty;
  const compact = variant !== "full";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex gap-5 border-b border-line",
        compact ? "py-5" : "py-7",
      )}
    >
      <div className={cn("shrink-0", compact ? "w-16" : "w-24 sm:w-28")}>
        {line.kind === "catalogue" ? (
          <Link href={`/store/${line.slug}`} className="block">
            <Relic kind={line.relic} className="aspect-4/5" quiet />
          </Link>
        ) : (
          <Relic kind={line.relic} className="aspect-4/5" quiet />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {line.kind === "catalogue" ? (
              <Link
                href={`/store/${line.slug}`}
                className={cn("ul block text-fg", compact ? "text-[14px]" : "text-[15px]")}
              >
                {line.name}
              </Link>
            ) : (
              <p className={cn("text-fg", compact ? "text-[14px]" : "text-[15px]")}>{line.name}</p>
            )}
            <p className="mt-1 text-[12px] leading-snug text-faint">{line.line}</p>
          </div>
          <p
            className={cn(
              "shrink-0 tabular-nums text-fg",
              compact ? "text-[14px]" : "text-[15px]",
            )}
          >
            {money(lineTotal(line))}
          </p>
        </div>

        {line.options.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {line.options.map((option) => (
              <li key={option.label} className="tag-sm text-muted">
                <span className="text-faint">{option.label}</span> {option.value}
              </li>
            ))}
          </ul>
        )}

        {line.custom && (
          <p className="text-[12px] leading-snug text-faint">
            {line.custom.fileName} · {line.custom.bboxMm.map((mm) => Math.round(mm)).join(" × ")}mm ·{" "}
            {line.custom.volumeCm3.toFixed(1)}cm³ · ~{line.custom.estimatedHours.toFixed(1)}h on the
            machine
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-1">
          {editable ? (
            <Stepper
              value={line.qty}
              onChange={(qty) => onQty?.(qty)}
              label={`Quantity — ${line.name}`}
              compact={compact}
            />
          ) : (
            <span className="tag-sm text-faint">
              Qty {line.qty}
              {/* A custom run was priced at this quantity — setup is amortised
                  into the unit, so changing it here would quietly overcharge. */}
              {line.kind === "custom" && variant !== "static" && (
                <span className="ml-3 normal-case tracking-normal">
                  fixed to the quote
                </span>
              )}
            </span>
          )}

          <div className="flex items-center gap-4">
            <span className="tag-sm text-faint">
              {line.digital ? "Download" : `${money(line.unitCents)} each`}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="tag-sm ul text-faint transition-colors hover:text-accent"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
