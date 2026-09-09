"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { LineRow } from "@/components/shop/line-row";
import { Empty, Stat } from "@/components/shop/bits";
import { Lines, Reveal } from "@/components/ui/reveal";
import { Mark } from "@/components/chrome/mark";
import { money, moneyExact } from "@/lib/shop/format";
import { useHydrated, useOrders, type Order } from "@/lib/shop/store";
import { site } from "@/lib/site";

/**
 * The receipt.
 *
 * Orders are kept on the device that placed them — there is no account system
 * yet, and inventing one to render a confirmation would be dishonest about
 * what this is. A cleared browser loses the record, which the page says out
 * loud rather than leaving to be discovered.
 */
export function OrderView({ id }: { id: string }) {
  const orders = useOrders();
  const hydrated = useHydrated();
  const order = orders.find((entry) => entry.id === id);

  if (!hydrated) return <Settling />;

  if (!order) {
    return (
      <main id="main" className="pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="shell pb-24">
          <Empty
            eyebrow={`Order ${id}`}
            title={
              <>
                No record on this <span className="thin text-gold">device</span>.
              </>
            }
            body="Receipts are kept in this browser rather than in an account, so a different device — or cleared site data — will not find one. The confirmation email is the durable copy."
          />
        </div>
      </main>
    );
  }

  const placed = new Date(order.placedAt);
  const [readyLow, readyHigh] = order.eta;

  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[10%] -top-[20%] block w-[60vw] max-w-[720px] text-bone/[0.04]"
        >
          <Mark className="w-full animate-drift" />
        </span>
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span className="text-accent">Confirmed</span>
              <span className="text-faint">{order.id}</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[13ch]"
            lines={[
              <Fragment key="a">It goes in</Fragment>,
              <Fragment key="b">
                the <span className="thin text-gold">queue</span>.
              </Fragment>,
            ]}
          />
          <Reveal immediate delay={0.45}>
            <p className="lede mt-9 max-w-xl">
              Thank you, {order.contact.name.split(" ")[0]}. A confirmation is on its way to{" "}
              <span className="text-fg">{order.contact.email}</span>
              {order.totals.digitalOnly
                ? ", with the download links attached."
                : `, and the parcel is ready to leave in ${readyLow}–${readyHigh} business days.`}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-16">
          <div className="min-w-0">
            <Timeline digital={order.totals.digitalOnly} />

            <div className="mt-14">
              <p className="tag-sm text-faint">Printed for you</p>
              <div className="mt-4">
                {order.lines.map((line) => (
                  <LineRow key={line.id} line={line} variant="static" />
                ))}
              </div>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t-2 border-line pt-10 sm:grid-cols-3">
              <Stat label="Order" value={order.id} />
              <Stat
                label="Placed"
                value={placed.toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
              <Stat label="Paid with" value={order.payment.detail} />
              {!order.totals.digitalOnly && (
                <>
                  <Stat label="Delivery" value={order.shippingLabel} />
                  <Stat
                    label="Ready by"
                    value={businessDaysFrom(placed, readyHigh).toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric",
                    })}
                  />
                  <Stat
                    label="Sending to"
                    value={
                      order.address
                        ? `${order.address.city}, ${order.address.region}`
                        : "Collection in person"
                    }
                  />
                </>
              )}
            </dl>

            {order.lines.some((line) => line.digital) && (
              <div className="mt-12 border-2 border-line bg-surface p-7">
                <p className="tag-sm text-accent">Digital goods</p>
                <p className="lede mt-4 max-w-xl">
                  Download links for every digital item are in the confirmation email and stay live
                  for a year. They are personal to this order — the licence covers your own printing
                  and small-run selling, not redistribution of the files.
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <Receipt order={order} />
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/store" className="btn w-full">
                Back to the shop
              </Link>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(`Order ${order.id}`)}`}
                className="tag-sm ul self-center text-muted hover:text-accent"
              >
                Something wrong? Write to us
              </a>
            </div>
            <p className="mt-6 text-[12px] leading-snug text-faint">
              This receipt is stored in this browser only. Keep the confirmation email — it is the
              copy that survives a cleared cache.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Receipt({ order }: { order: Order }) {
  const { totals } = order;
  return (
    <div className="border-2 border-line bg-surface p-7 md:p-8">
      <p className="tag-sm text-faint">Receipt</p>
      <dl className="mt-7 flex flex-col gap-4">
        <Row label="Subtotal">{money(totals.subtotalCents)}</Row>
        {totals.discountCents > 0 && (
          <Row label={order.promoCode ?? "Discount"} accent>
            −{money(totals.discountCents)}
          </Row>
        )}
        <Row label={totals.digitalOnly ? "Delivery" : "Shipping"}>
          {totals.digitalOnly
            ? "By email"
            : totals.shippingCents === 0
              ? "Free"
              : money(totals.shippingCents)}
        </Row>
        <Row label={totals.taxLabel}>{money(totals.taxCents)}</Row>
      </dl>
      <div className="mt-7 flex items-baseline justify-between gap-4 border-t-2 border-line pt-6">
        <p className="text-[15px] text-fg">Paid</p>
        <p className="d4 tabular-nums text-fg">
          {moneyExact(totals.totalCents)}
          <span className="tag-sm ml-2.5 align-middle text-faint">CAD</span>
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd className={`shrink-0 text-[14px] tabular-nums ${accent ? "text-accent" : "text-fg"}`}>
        {children}
      </dd>
    </div>
  );
}

const physicalStages = [
  { name: "Received", note: "Payment authorised, order logged" },
  { name: "In the queue", note: "Slotted against the machines" },
  { name: "Printing", note: "On the bed, layer by layer" },
  { name: "Finishing", note: "Supports off, bench work, quality" },
  { name: "Shipped", note: "Tracking emailed" },
];

const digitalStages = [
  { name: "Received", note: "Payment authorised, order logged" },
  { name: "Files prepared", note: "Licence stamped to your name" },
  { name: "Sent", note: "Links emailed, live for a year" },
];

function Timeline({ digital }: { digital: boolean }) {
  const stages = digital ? digitalStages : physicalStages;
  return (
    <ol className="flex flex-col gap-0">
      {stages.map((stage, i) => (
        <motion.li
          key={stage.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-6"
        >
          <div className="flex flex-col items-center">
            <span
              className={`mt-1.5 size-3 shrink-0 rounded-full ${
                i === 0 ? "bg-accent" : "border-2 border-line-strong"
              }`}
            />
            {i < stages.length - 1 && <span className="w-px flex-1 bg-line" />}
          </div>
          <div className="pb-8">
            <p className={`text-[15px] ${i === 0 ? "text-fg" : "text-muted"}`}>{stage.name}</p>
            <p className="mt-1 text-[13px] text-faint">{stage.note}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

function Settling() {
  return (
    <main id="main" className="grid min-h-[70svh] place-items-center">
      <p className="tag-sm text-faint">Finding the order…</p>
    </main>
  );
}

/** Weekends do not print. */
function businessDaysFrom(start: Date, days: number) {
  const date = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}
