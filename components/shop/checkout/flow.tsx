"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Field, RadioRow } from "@/components/shop/checkout/field";
import { PaymentStep } from "@/components/shop/checkout/payment-step";
import { Empty } from "@/components/shop/bits";
import { LineRow } from "@/components/shop/line-row";
import { Summary, useAppliedPromo } from "@/components/shop/summary";
import { Lines, Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { money } from "@/lib/shop/format";
import { getProduct } from "@/lib/shop/catalog";
import {
  calculateTotals,
  findMethod,
  methodsForZone,
  zones,
  type CartLine,
  type ShippingId,
  type ZoneId,
} from "@/lib/shop/pricing";
import { authorise, emptyCard, validateCard, type CardDraft } from "@/lib/shop/payment";
import { useCart, usePromoCode, type PaymentMethodId } from "@/lib/shop/store";
import { submitOrder } from "@/app/actions/orders";
import { cn } from "@/lib/utils";

type StepId = "contact" | "delivery" | "payment" | "review";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Rush tiers set the print queue; these are the days they buy. */
const customLead: Record<string, [number, number]> = {
  standard: [7, 12],
  priority: [3, 5],
  overnight: [1, 2],
};

/**
 * Checkout.
 *
 * Four steps, one at a time, each validated before the next appears — because
 * a single long form asks for a card number before it has established there is
 * anywhere to send the thing. Digital-only carts drop the delivery step
 * entirely rather than showing an address form nobody needs to fill in.
 *
 * The order itself is real: `submitOrder` sends the cart's *intent* — slugs,
 * options, quantities — and nisir-backend prices it from the catalogue, so
 * the total on the receipt is the server's figure rather than this page's.
 * The card step is still the staged one; `lib/shop/payment.ts` explains what
 * is real there and what is not.
 */
export function CheckoutFlow({
  /**
   * The signed-in account, handed down by the page. Checkout is gated, so
   * there is always one — the name and email only seed the contact step
   * rather than fixing it, because an order can be sent to someone else.
   */
  customer,
}: {
  customer?: { name: string; email: string };
}) {
  const router = useRouter();
  const cart = useCart();
  const [, setPromoCode] = usePromoCode();
  const promo = useAppliedPromo(cart.subtotalCents);

  const [step, setStep] = useState<StepId>("contact");
  const [contact, setContact] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: "",
  });
  const [zone, setZone] = useState<ZoneId>("ca");
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal: "",
  });
  const [shipping, setShipping] = useState<ShippingId>("standard");
  const [method, setMethod] = useState<PaymentMethodId>("card");
  const [card, setCard] = useState<CardDraft>(emptyCard);
  const [handset, setHandset] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totals = calculateTotals(cart.lines, { zone, shipping, promo });
  const shippingMethod = findMethod(zone, shipping);

  const steps: StepId[] = totals.digitalOnly
    ? ["contact", "payment", "review"]
    : ["contact", "delivery", "payment", "review"];
  const position = steps.indexOf(step);

  const eta = useMemo(() => estimateEta(cart.lines, shippingMethod?.transit ?? [0, 0]), [
    cart.lines,
    shippingMethod,
  ]);

  if (cart.lines.length === 0 && !busy) {
    return (
      <main id="main" className="pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="shell pb-24">
          <Empty
            eyebrow="Checkout"
            title={
              <>
                Nothing to <span className="thin text-gold">pay for</span>.
              </>
            }
            body="The cart is empty, so there is no order to place. Everything in the shop is printed to order."
          />
        </div>
      </main>
    );
  }

  function validate(target: StepId) {
    const next: Record<string, string> = {};

    if (target === "contact") {
      if (!contact.name.trim()) next.name = "We address the parcel to somebody.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(contact.email)) {
        next.email = "A working email — the receipt and the files go there.";
      }
    }

    if (target === "delivery") {
      if (!shippingMethod?.pickup) {
        if (!address.line1.trim()) next.line1 = "Street address.";
        if (!address.city.trim()) next.city = "City.";
        if (!address.region.trim()) next.region = zone === "ca" ? "Province." : "Region.";
        if (zone === "ca" && !/^[a-z]\d[a-z][ -]?\d[a-z]\d$/i.test(address.postal.trim())) {
          next.postal = "A Canadian postal code, like M5V 2T6.";
        }
        if (zone !== "ca" && !address.postal.trim() && zone === "intl") {
          next.postal = "Postal or ZIP code.";
        }
      }
    }

    if (target === "payment") {
      if (method === "card") Object.assign(next, validateCard(card));
      if ((method === "telebirr" || method === "cbe") && handset.replace(/\D/g, "").length < 9) {
        next.handset = "The number the approval prompt goes to.";
      }
    }

    return next;
  }

  function advance() {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const next = steps[position + 1];
    if (next) setStep(next);
  }

  async function placeOrder() {
    // Re-run every gate, not just the last one: a shopper can walk backwards
    // and empty a field after it has already been accepted.
    for (const target of steps) {
      const found = validate(target);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        setStep(target);
        return;
      }
    }

    setBusy(true);
    setSubmitError(null);

    // The order is created first, and priced by the server. If the catalogue
    // moved under this cart — a price edit, an expired code, the last one
    // sold — this is where that surfaces, before any card is touched.
    const placed = await submitOrder({
      lines: cart.lines.map(toOrderLine),
      contact,
      address:
        totals.digitalOnly || shippingMethod?.pickup
          ? undefined
          : { ...address, country: zones.find((entry) => entry.id === zone)?.name ?? "" },
      zone,
      shipping,
      promoCode: promo?.code,
      paymentMethod: method,
    });

    if (!placed.ok) {
      setBusy(false);
      setSubmitError(placed.message);
      return;
    }

    const result = await authorise(method, card, placed.order.id);
    if (!result.ok) {
      setBusy(false);
      // The order stays on file as unpaid rather than vanishing, which is what
      // lets the shopper retry against the same order number.
      router.push(`/store/checkout/failed?code=${result.code}&order=${placed.order.id}`);
      return;
    }

    cart.clear();
    setPromoCode("");
    router.push(`/store/order/${placed.order.id}`);
  }

  return (
    <main id="main">
      <section className="slab-ink pb-12 pt-[calc(var(--header-h)+clamp(32px,6vh,72px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/store/cart" className="ul transition-colors hover:text-accent">
                Cart
              </Link>
              <span className="text-faint">Checkout</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.1}
            className="d2 mt-7"
            lines={[
              <Fragment key="a">
                Confirm and <span className="thin text-gold">print</span>.
              </Fragment>,
            ]}
          />
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-16">
          <div className="min-w-0">
            {/* The rail. Completed steps go back; future ones do not jump. */}
            <ol className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-line pb-5">
              {steps.map((entry, i) => {
                const done = i < position;
                return (
                  <li key={entry}>
                    <button
                      type="button"
                      disabled={!done}
                      onClick={() => setStep(entry)}
                      className={cn(
                        "tag-sm flex items-center gap-2.5 transition-colors duration-300",
                        entry === step
                          ? "text-accent"
                          : done
                            ? "text-muted hover:text-fg"
                            : "text-faint",
                      )}
                    >
                      <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className={done ? "ul" : undefined}>{labels[entry]}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: EASE }}
                className="pt-10"
              >
                {step === "contact" && (
                  <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                    <Field
                      label="Name"
                      value={contact.name}
                      onChange={(next) => setContact({ ...contact, name: next })}
                      error={errors.name}
                      placeholder="Your name"
                      autoComplete="name"
                      className="sm:col-span-2"
                    />
                    <Field
                      label="Email"
                      value={contact.email}
                      onChange={(next) => setContact({ ...contact, email: next })}
                      error={errors.email}
                      placeholder="you@somewhere.com"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      hint="The receipt, the tracking and any digital files go here."
                    />
                    <Field
                      label="Phone"
                      value={contact.phone}
                      onChange={(next) => setContact({ ...contact, phone: next })}
                      placeholder="Optional"
                      autoComplete="tel"
                      inputMode="tel"
                      required={false}
                      hint="Only used if the courier needs it."
                    />
                  </div>
                )}

                {step === "delivery" && (
                  <div className="flex flex-col gap-10">
                    <fieldset>
                      <legend className="tag-sm text-faint">Destination</legend>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {zones.map((entry) => (
                          <RadioRow
                            key={entry.id}
                            selected={zone === entry.id}
                            onSelect={() => {
                              setZone(entry.id);
                              setShipping(methodsForZone(entry.id)[0].id);
                            }}
                            title={entry.name}
                            note={entry.note}
                          />
                        ))}
                      </div>
                    </fieldset>

                    {!shippingMethod?.pickup && (
                      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                        <Field
                          label="Address"
                          value={address.line1}
                          onChange={(next) => setAddress({ ...address, line1: next })}
                          error={errors.line1}
                          placeholder="Street and number"
                          autoComplete="address-line1"
                          className="sm:col-span-2"
                        />
                        <Field
                          label="Apartment, suite"
                          value={address.line2}
                          onChange={(next) => setAddress({ ...address, line2: next })}
                          placeholder="Optional"
                          autoComplete="address-line2"
                          required={false}
                          className="sm:col-span-2"
                        />
                        <Field
                          label="City"
                          value={address.city}
                          onChange={(next) => setAddress({ ...address, city: next })}
                          error={errors.city}
                          placeholder={zone === "et" ? "Addis Ababa" : "Toronto"}
                          autoComplete="address-level2"
                        />
                        <Field
                          label={zone === "ca" ? "Province" : "Region"}
                          value={address.region}
                          onChange={(next) => setAddress({ ...address, region: next })}
                          error={errors.region}
                          placeholder={zone === "ca" ? "Ontario" : ""}
                          autoComplete="address-level1"
                        />
                        <Field
                          label={zone === "ca" ? "Postal code" : "Postal / ZIP"}
                          value={address.postal}
                          onChange={(next) => setAddress({ ...address, postal: next })}
                          error={errors.postal}
                          placeholder={zone === "ca" ? "M5V 2T6" : "Optional"}
                          autoComplete="postal-code"
                          required={zone !== "et"}
                        />
                      </div>
                    )}

                    <fieldset>
                      <legend className="tag-sm text-faint">Method</legend>
                      <div className="mt-4 flex flex-col gap-2">
                        {methodsForZone(zone).map((entry) => (
                          <RadioRow
                            key={`${entry.id}-${entry.name}`}
                            selected={shipping === entry.id}
                            onSelect={() => setShipping(entry.id)}
                            title={entry.name}
                            note={
                              entry.pickup
                                ? entry.note
                                : `${entry.note} · ${entry.transit[0]}–${entry.transit[1]} days in transit`
                            }
                            aside={entry.cents === 0 ? "Free" : money(entry.cents)}
                          />
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {step === "payment" && (
                  <PaymentStep
                    zone={zone}
                    method={method}
                    onMethod={setMethod}
                    card={card}
                    onCard={setCard}
                    handset={handset}
                    onHandset={setHandset}
                    errors={errors}
                  />
                )}

                {step === "review" && (
                  <div className="flex flex-col gap-10">
                    <Recap
                      title="Contact"
                      onEdit={() => setStep("contact")}
                      rows={[contact.name, contact.email, contact.phone].filter(Boolean)}
                    />
                    {!totals.digitalOnly && (
                      <Recap
                        title="Delivery"
                        onEdit={() => setStep("delivery")}
                        rows={[
                          shippingMethod?.pickup
                            ? shippingMethod.name
                            : [address.line1, address.line2, address.city, address.region, address.postal]
                                .filter(Boolean)
                                .join(", "),
                          `${shippingMethod?.name} — ready in ${eta[0]}–${eta[1]} business days`,
                        ].filter(Boolean)}
                      />
                    )}
                    <Recap
                      title="Payment"
                      onEdit={() => setStep("payment")}
                      rows={[
                        method === "card"
                          ? `Card ending ${card.number.replace(/\D/g, "").slice(-4) || "————"}`
                          : method === "transfer"
                            ? "Bank transfer — details emailed"
                            : `${method === "cbe" ? "CBE Birr" : "telebirr"} — ${handset}`,
                      ]}
                    />

                    <div>
                      <p className="tag-sm text-faint">In the order</p>
                      <div className="mt-4">
                        {cart.lines.map((line) => (
                          <LineRow key={line.id} line={line} variant="static" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex flex-wrap items-center gap-6">
              {position > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(steps[position - 1])}
                  className="tag-sm ul text-muted transition-colors hover:text-fg"
                >
                  ← {labels[steps[position - 1]]}
                </button>
              )}
              <div className="ml-auto">
                {step === "review" ? (
                  <Magnetic strength={0.2}>
                    <button
                      type="button"
                      onClick={placeOrder}
                      disabled={busy}
                      className="btn btn-solid disabled:pointer-events-none disabled:opacity-70"
                    >
                      {busy ? "Placing the order…" : `Pay ${money(totals.totalCents)}`}
                    </button>
                  </Magnetic>
                ) : (
                  <button type="button" onClick={advance} className="btn btn-solid">
                    Continue
                  </button>
                )}
              </div>
            </div>

            {/* The server refused the order — a sold-out object, a code that
                expired between the cart and here. Say which. */}
            {submitError && (
              <p
                role="alert"
                className="mt-6 border-l-2 border-accent pl-4 text-[14px] leading-snug text-fg"
              >
                {submitError}
              </p>
            )}
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <Summary
              totals={totals}
              promo={promo}
              zone={zone}
              shippingLabel={shippingMethod ? `Shipping — ${shippingMethod.name}` : undefined}
            >
              {!totals.digitalOnly && (
                <p className="text-[12px] leading-snug text-faint">
                  Printed and ready in {eta[0]}–{eta[1]} business days from confirmation.
                </p>
              )}
            </Summary>
          </div>
        </div>
      </section>
    </main>
  );
}

const labels: Record<StepId, string> = {
  contact: "Contact",
  delivery: "Delivery",
  payment: "Payment",
  review: "Review",
};

function Recap({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: string[];
  onEdit: () => void;
}) {
  return (
    <div className="border-b border-line pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="tag-sm text-faint">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="tag-sm ul text-muted transition-colors hover:text-accent"
        >
          Edit
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {rows.map((row) => (
          <p key={row} className="text-[15px] text-fg">
            {row}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * A cart line, reduced to what the server needs to price it for itself.
 *
 * The catalogue line id is `slug:material:finish:size` (see `lineId`), which
 * is exactly the configuration — no separate bookkeeping required. Note that
 * `unitCents` is deliberately not sent: the backend rejects unknown fields,
 * and a cart that could name its own price would not be a cart.
 */
function toOrderLine(line: CartLine) {
  if (line.kind === "custom" && line.custom) {
    return {
      kind: "custom" as const,
      qty: line.qty,
      fileId: line.custom.fileId,
      material: line.custom.material,
      finish: line.custom.finish,
      custom: {
        scale: line.custom.scale,
        infill: line.custom.infill,
        layerMm: line.custom.layerMm,
        rush: line.custom.rush,
        note: line.custom.note,
      },
    };
  }

  const [slug, material, finish, size] = line.id.split(":");
  return { kind: "catalogue" as const, qty: line.qty, slug, material, finish, size };
}

/** Slowest thing in the cart, plus transit. */
function estimateEta(
  lines: { slug: string; kind: string; custom?: { rush: string } }[],
  transit: [number, number],
): [number, number] {
  let low = 0;
  let high = 0;
  for (const line of lines) {
    const days =
      line.kind === "custom"
        ? (customLead[line.custom?.rush ?? "standard"] ?? customLead.standard)
        : (getProduct(line.slug)?.leadDays ?? [0, 0]);
    low = Math.max(low, days[0]);
    high = Math.max(high, days[1]);
  }
  return [low + transit[0], high + transit[1]];
}
