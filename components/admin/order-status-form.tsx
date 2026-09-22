"use client";

import { useActionState, useState } from "react";
import { changeOrderStatus } from "@/app/actions/admin";
import { button, control, FormMessage, Label } from "@/components/admin/ui";
import { ORDER_STATUSES, type AdminFormState, type OrderStatus } from "@/lib/admin/types";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Moves an order on.
 *
 * Says what the move will do before it does it: the two statuses that end an
 * order without shipping it put its units back on the shelf, and every move
 * except back to "awaiting payment" emails the customer. Neither is something
 * to find out about afterwards.
 */
export function OrderStatusForm({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    changeOrderStatus.bind(null, orderId),
    undefined,
  );
  const [chosen, setChosen] = useState<OrderStatus>(current);
  const hydrated = useHydrated();

  const target = ORDER_STATUSES.find((entry) => entry.id === chosen);
  const from = ORDER_STATUSES.find((entry) => entry.id === current);
  const releases = target?.releasesStock && !from?.releasesStock;
  const retakes = !target?.releasesStock && from?.releasesStock;

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (releases && !window.confirm(`Mark ${orderId} ${target?.label.toLowerCase()}? Its units go back on the shelf and the customer is emailed.`)) {
          event.preventDefault();
        }
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <Label htmlFor="order-status">Status</Label>
        <select
          id="order-status"
          name="status"
          value={chosen}
          onChange={(event) => setChosen(event.target.value as OrderStatus)}
          className={control}
        >
          {ORDER_STATUSES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      {chosen !== current && (
        <p className="text-[12px] leading-relaxed text-muted">
          {releases && "Puts this order's units back in stock. "}
          {retakes && "Takes this order's units out of stock again — refused if they have sold since. "}
          {chosen !== "pending_payment" && "The customer gets an email about it."}
        </p>
      )}

      <FormMessage state={state} />

      <button
        type="submit"
        disabled={!hydrated || pending || chosen === current}
        className={cn(button.base, button.primary)}
      >
        {pending ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}
