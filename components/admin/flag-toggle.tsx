"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setProductFlag } from "@/app/actions/admin";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * One of a product's two switches — on the shelf, or featured — flipped from
 * a list without opening the product.
 *
 * Optimistic, because waiting a round trip to see a checkbox tick feels
 * broken; if the server refuses, the switch falls back and says why.
 */
export function FlagToggle({
  slug,
  flag,
  value,
  label,
}: {
  slug: string;
  flag: "active" | "featured";
  value: boolean;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Before hydration a tick would change the box and nothing else.
  const hydrated = useHydrated();

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <label className={cn("inline-flex cursor-pointer items-center gap-2", pending && "opacity-60")}>
        <input
          type="checkbox"
          checked={optimistic}
          disabled={!hydrated || pending}
          onChange={(event) => {
            const next = event.target.checked;
            setError(null);
            startTransition(async () => {
              setOptimistic(next);
              const result = await setProductFlag(slug, flag, next);
              if (!result?.ok) setError(result?.message ?? "Not saved.");
            });
          }}
          className="size-4 accent-[var(--gold-deep)]"
        />
        <span className="sr-only">{label}</span>
      </label>
      {error && (
        <span role="alert" className="text-[11px] text-[#9b2c2c]">
          {error}
        </span>
      )}
    </span>
  );
}
