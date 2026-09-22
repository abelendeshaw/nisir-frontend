import Link from "next/link";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Flag, PageHeader, Panel, StatusBadge, dateTime } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import { money, moneyExact } from "@/lib/shop/format";

export const generateMetadata = adminTitle("Order");

export default async function OrderPage({ params }: PageProps<"/[admin]/orders/[id]">) {
  const { admin, id } = await params;
  const context = await requireAdmin(admin);
  const order = await adminData(context, (token) => api.order(token, id));
  const root = `/${context.base}`;

  const totals: [string, number][] = [
    ["Subtotal", order.totals.subtotalCents],
    ["Discount", -order.totals.discountCents],
    ["Shipping", order.totals.shippingCents],
    [order.totals.taxLabel || "Tax", order.totals.taxCents],
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Order"
        title={order.id}
        lede={<>Placed {dateTime(order.placedAt)} · last changed {dateTime(order.updatedAt)}</>}
        actions={
          <Link href={`${root}/orders`} className="tag-sm text-faint hover:text-fg">
            ← All orders
          </Link>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <Panel title="Items">
            <ul className="flex flex-col divide-y divide-[var(--line)]">
              {order.lines.map((line) => (
                <li key={line.id} className="flex flex-wrap justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {line.qty} × {line.name}
                      {line.digital && <span className="ml-2"><Flag>Digital</Flag></span>}
                      {line.kind === "custom" && <span className="ml-2"><Flag>Custom print</Flag></span>}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      {line.options.map((option) => `${option.label}: ${option.value}`).join(" · ")}
                    </p>
                    {line.custom && (
                      <div className="mt-2 text-[13px] text-muted">
                        <p>
                          {line.custom.fileName} · {line.custom.volumeCm3.toFixed(1)}cm³ ·{" "}
                          {line.custom.estimatedHours.toFixed(1)}h estimated
                        </p>
                        {(line.custom.watertight === false || line.custom.inverted === true) && (
                          <p className="mt-1 text-gold-deep">
                            The mesh {line.custom.watertight === false ? "is not watertight" : "has inverted normals"} —
                            check it before printing.
                          </p>
                        )}
                        {line.custom.note && <p className="mt-1 italic">“{line.custom.note}”</p>}
                      </div>
                    )}
                    {line.customFileId && (
                      <a
                        href={`${root}/uploads/${line.customFileId}`}
                        className="tag-sm mt-3 inline-block text-gold-deep underline-offset-4 hover:underline"
                      >
                        Download model
                      </a>
                    )}
                  </div>
                  <p className="shrink-0 tabular-nums">{money(line.unitCents * line.qty)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 grid gap-1.5 border-t-2 border-line pt-4 text-[14px]">
              {totals.map(([label, cents]) =>
                cents === 0 && label === "Discount" ? null : (
                  <div key={label} className="flex justify-between text-muted">
                    <dt>{label}</dt>
                    <dd className="tabular-nums">{moneyExact(cents)}</dd>
                  </div>
                ),
              )}
              <div className="mt-2 flex justify-between text-[16px] font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{moneyExact(order.totals.totalCents)}</dd>
              </div>
            </dl>
            {order.promoCode && <p className="mt-3 text-[13px] text-muted">Promo: {order.promoCode}</p>}
          </Panel>

          <div className="grid gap-8 md:grid-cols-2">
            <Panel title="Customer">
              <p className="font-semibold">{order.contact.name}</p>
              <p className="mt-1 text-[14px]">
                <a href={`mailto:${order.contact.email}`} className="hover:text-gold-deep">
                  {order.contact.email}
                </a>
              </p>
              <p className="mt-1 text-[14px]">
                <a href={`tel:${order.contact.phone}`} className="hover:text-gold-deep">
                  {order.contact.phone}
                </a>
              </p>
              <p className="mt-3 text-[12px] text-faint">{order.userId ? "Signed-in customer" : "Guest checkout"}</p>
            </Panel>

            <Panel title="Delivery">
              {order.address ? (
                <address className="text-[14px] not-italic leading-relaxed">
                  {order.address.line1}
                  {order.address.line2 && <><br />{order.address.line2}</>}
                  <br />
                  {[order.address.city, order.address.region, order.address.postal].filter(Boolean).join(", ")}
                  <br />
                  {order.address.country}
                </address>
              ) : (
                <p className="text-[14px] text-muted">No address — collection or digital only.</p>
              )}
              <p className="mt-3 text-[13px] text-muted">
                {order.shippingLabel} · {order.eta[1] === 0 ? "instant" : `${order.eta[0]}–${order.eta[1]} days`}
              </p>
            </Panel>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <Panel title="Status">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <StatusBadge status={order.status} label={order.statusLabel} />
              {order.needsReview && <Flag tone="warn">Needs review</Flag>}
            </div>
            <OrderStatusForm orderId={order.id} current={order.status} />
          </Panel>

          <Panel title="Payment">
            <p className="text-[14px]">{order.payment.label}</p>
            <p className="mt-1 text-[13px] text-muted">{order.payment.detail}</p>
          </Panel>

          <Panel title="Confirmation email">
            <p className="text-[14px] text-muted">
              {order.confirmationEmailedAt
                ? `Sent ${dateTime(order.confirmationEmailedAt)}.`
                : "Not recorded as sent — the customer may not have a receipt. Worth a check of the mail log."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
