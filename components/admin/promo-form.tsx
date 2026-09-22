"use client";

import { useActionState, useState, useTransition } from "react";
import { deletePromo, savePromo } from "@/app/actions/admin";
import { button, control, FieldError, FormMessage, Label } from "@/components/admin/ui";
import type { AdminFormState, AdminPromo, PromoKind } from "@/lib/admin/types";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Create a promo code, or replace one by saving over its code.
 *
 * Values are typed the way people think of them — 15 for 15% off, 10 for $10
 * off — and converted to what pricing stores (a fraction, and cents) by the
 * action. Getting this wrong used to be one keystroke from a 1500% discount.
 */
export function PromoForm({ editing, onDone }: { editing?: AdminPromo; onDone?: () => void }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(async (previous, form) => {
    const result = await savePromo(previous, form);
    if (result?.ok) onDone?.();
    return result;
  }, undefined);

  const [kind, setKind] = useState<PromoKind>(editing?.kind ?? "percent");
  const [expiresIso, setExpiresIso] = useState(editing?.expiresAt ?? "");
  const errors = state?.errors ?? {};
  const hydrated = useHydrated();

  const initialValue = editing
    ? editing.kind === "percent"
      ? String(Math.round(editing.value * 10000) / 100)
      : editing.kind === "amount"
        ? (editing.value / 100).toFixed(2)
        : ""
    : "";

  return (
    <form key={editing?.code ?? "new"} action={action} className="grid gap-5 md:grid-cols-2">
      <div>
        <Label htmlFor="promo-code">Code</Label>
        <input
          id="promo-code"
          name="code"
          defaultValue={editing?.code}
          readOnly={editing !== undefined}
          required
          maxLength={40}
          pattern="[A-Za-z0-9_\-]+"
          className={cn(control, "uppercase", editing && "opacity-60")}
        />
        <FieldError messages={errors.code} />
      </div>
      <div>
        <Label htmlFor="promo-label">Label (shown to the customer)</Label>
        <input id="promo-label" name="label" defaultValue={editing?.label} required maxLength={120} className={control} />
        <FieldError messages={errors.label} />
      </div>
      <div>
        <Label htmlFor="promo-kind">Kind</Label>
        <select
          id="promo-kind"
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as PromoKind)}
          className={control}
        >
          <option value="percent">Percent off</option>
          <option value="amount">Amount off</option>
          <option value="shipping">Free shipping</option>
        </select>
        <FieldError messages={errors.kind} />
      </div>
      {kind !== "shipping" && (
        <div>
          <Label htmlFor="promo-value">{kind === "percent" ? "Percent off (e.g. 15)" : "Dollars off (e.g. 10)"}</Label>
          <input
            id="promo-value"
            name="value"
            type="number"
            step="0.01"
            min="0.01"
            max={kind === "percent" ? "100" : undefined}
            defaultValue={initialValue}
            required
            className={control}
          />
          <FieldError messages={errors.value} />
        </div>
      )}
      <div>
        <Label htmlFor="promo-minimum">Minimum subtotal (dollars, optional)</Label>
        <input
          id="promo-minimum"
          name="minimum"
          type="number"
          step="0.01"
          min="0"
          defaultValue={editing?.minimumCents != null ? (editing.minimumCents / 100).toFixed(2) : ""}
          className={control}
        />
        <FieldError messages={errors.minimumCents} />
      </div>
      <div>
        <Label htmlFor="promo-expires">Expires (optional, your local time)</Label>
        <input
          id="promo-expires"
          type="datetime-local"
          defaultValue={editing?.expiresAt ? toLocalInput(editing.expiresAt) : ""}
          onChange={(event) =>
            setExpiresIso(event.target.value ? new Date(event.target.value).toISOString() : "")
          }
          className={control}
        />
        <input type="hidden" name="expiresAtIso" value={expiresIso} />
        <FieldError messages={errors.expiresAt} />
      </div>
      <label className="flex cursor-pointer items-center gap-3 md:col-span-2">
        <input type="checkbox" name="active" defaultChecked={editing?.active ?? true} className="size-4 accent-[var(--gold-deep)]" />
        <span className="text-[14px]">Active — customers can use it</span>
      </label>

      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button type="submit" disabled={!hydrated || pending} className={cn(button.base, button.primary)}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create promo"}
        </button>
        {editing && onDone && (
          <button type="button" onClick={onDone} className={cn(button.base, button.ghost)}>
            Cancel
          </button>
        )}
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** `2026-10-01T12:00:00Z` as the value a `datetime-local` input shows, in the viewer's zone. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** One row's edit and delete buttons, and the edit form when it is open. */
export function PromoRowActions({ promo }: { promo: AdminPromo }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditing((was) => !was)} className={cn(button.base, button.ghost, "h-8 px-3")}>
          {editing ? "Close" : "Edit"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Delete ${promo.code}? Switching it off keeps it for later instead.`)) return;
            startTransition(async () => {
              const result = await deletePromo(promo.code);
              if (!result?.ok) setError(result?.message ?? "Not deleted.");
            });
          }}
          className={cn(button.base, button.danger, "h-8 px-3")}
        >
          Delete
        </button>
      </div>
      {error && <p role="alert" className="text-[12px] text-[#9b2c2c]">{error}</p>}
      {editing && (
        <div className="w-full border-t-2 border-line pt-4 text-left">
          <PromoForm editing={promo} onDone={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}
