"use client";

import { useActionState, useState } from "react";
import { adjustStock } from "@/app/actions/admin";
import { button, control, FormMessage } from "@/components/admin/ui";
import type { AdminFormState } from "@/lib/admin/types";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Stock, counted in by hand.
 *
 * Two ways, because they are two different jobs. A correction (`+12` after a
 * print run, `-1` for a piece that cracked) is applied on the server as an
 * increment, so an order placed while the admin was typing is not undone. A
 * recount sets the figure outright — for when the shelf has been counted and
 * the number on the screen is simply wrong.
 */
export function StockControl({ slug, stock, compact = false }: { slug: string; stock: number; compact?: boolean }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(adjustStock.bind(null, slug), undefined);
  const [mode, setMode] = useState<"delta" | "count">("delta");
  const hydrated = useHydrated();

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input type="hidden" name="mode" value={mode} />
        <select
          aria-label="How to change stock"
          value={mode}
          onChange={(event) => setMode(event.target.value as "delta" | "count")}
          className={cn(control, "w-auto px-2")}
        >
          <option value="delta">Add / remove</option>
          <option value="count">Set to</option>
        </select>
        <input
          name="amount"
          type="number"
          step={1}
          min={mode === "count" ? 0 : undefined}
          required
          aria-label={mode === "count" ? "Units on the shelf" : "Units to add, or negative to remove"}
          placeholder={mode === "count" ? String(stock) : "+5"}
          className={cn(control, compact ? "w-20" : "w-28")}
        />
        <button type="submit" disabled={!hydrated || pending} className={cn(button.base, button.ghost, "px-3")}>
          {pending ? "…" : "Apply"}
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
