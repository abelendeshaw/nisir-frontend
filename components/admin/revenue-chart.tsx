"use client";

import { useState } from "react";
import { money } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

type Day = { date: string; revenueCents: number; orders: number };

/**
 * Settled revenue per day over the dashboard's window.
 *
 * One series, so no legend — the panel title names it. Bars rather than a
 * line because each day is its own total, not a point on a continuous curve,
 * and because the empty days are the story as often as the full ones. Every
 * bar has a hover and focus target taller than itself, and the same figures
 * are in a table underneath for anyone who cannot use the chart.
 */
export function RevenueChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const peak = Math.max(1, ...days.map((day) => day.revenueCents));
  const shown = active === null ? null : days[active];

  const label = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

  return (
    <figure>
      <div className="flex h-8 items-baseline justify-between gap-4 text-[13px]">
        {shown ? (
          <>
            <span className="text-muted">{label(shown.date)}</span>
            <span className="tabular-nums text-fg">
              {money(shown.revenueCents)} · {shown.orders} {shown.orders === 1 ? "order" : "orders"}
            </span>
          </>
        ) : (
          <span className="text-faint">Hover or tab through a day for its figures.</span>
        )}
      </div>

      <div
        className="relative mt-2 flex h-40 items-end gap-[2px] border-b-2 border-line"
        onMouseLeave={() => setActive(null)}
      >
        {/* A recessive guide at the peak, so heights read against something. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line" />
        <span aria-hidden className="pointer-events-none absolute right-0 top-1 text-[10px] tabular-nums text-faint">
          {money(peak)}
        </span>

        {days.map((day, index) => (
          <button
            key={day.date}
            type="button"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            aria-label={`${label(day.date)}: ${money(day.revenueCents)}, ${day.orders} orders`}
            className="group flex h-full flex-1 items-end focus-visible:outline-offset-0"
          >
            <span
              className={cn(
                "block w-full rounded-t-[4px] bg-[var(--gold-deep)] transition-opacity",
                active !== null && active !== index && "opacity-40",
              )}
              style={{ height: day.revenueCents === 0 ? 0 : `max(2px, ${(day.revenueCents / peak) * 100}%)` }}
            />
          </button>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-faint">
        <span>{days[0] ? label(days[0].date) : ""}</span>
        <span>{days.at(-1) ? label(days.at(-1)!.date) : ""}</span>
      </div>

      <details className="mt-4">
        <summary className="tag-sm cursor-pointer text-faint hover:text-fg">Show as a table</summary>
        <table className="mt-3 w-full text-left text-[13px]">
          <thead>
            <tr className="text-faint">
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Revenue</th>
              <th className="py-1 text-right font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date} className="border-t border-line">
                <td className="py-1">{label(day.date)}</td>
                <td className="py-1 text-right tabular-nums">{money(day.revenueCents)}</td>
                <td className="py-1 text-right tabular-nums">{day.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
