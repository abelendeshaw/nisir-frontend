"use client";

import { AnimatePresence, motion } from "motion/react";
import { Field, RadioRow } from "@/components/shop/checkout/field";
import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  testCards,
  type CardDraft,
} from "@/lib/shop/payment";
import type { PaymentMethodId } from "@/lib/shop/store";
import type { ZoneId } from "@/lib/shop/pricing";

const methods: {
  id: PaymentMethodId;
  title: string;
  note: string;
  zones: ZoneId[] | "all";
}[] = [
  { id: "card", title: "Card", note: "Visa, Mastercard, Amex", zones: "all" },
  { id: "telebirr", title: "telebirr", note: "Approve on the handset", zones: ["et"] },
  { id: "cbe", title: "CBE Birr", note: "Commercial Bank of Ethiopia", zones: ["et"] },
  {
    id: "transfer",
    title: "Bank transfer",
    note: "Interac or wire — printed once funds land",
    zones: "all",
  },
];

export function PaymentStep({
  zone,
  method,
  onMethod,
  card,
  onCard,
  handset,
  onHandset,
  errors,
}: {
  zone: ZoneId;
  method: PaymentMethodId;
  onMethod: (next: PaymentMethodId) => void;
  card: CardDraft;
  onCard: (next: CardDraft) => void;
  handset: string;
  onHandset: (next: string) => void;
  errors: Record<string, string>;
}) {
  const available = methods.filter(
    (entry) => entry.zones === "all" || entry.zones.includes(zone),
  );
  const brand = detectBrand(card.number);

  return (
    <div className="flex flex-col gap-9">
      <div className="grid gap-2 sm:grid-cols-2">
        {available.map((entry) => (
          <RadioRow
            key={entry.id}
            selected={method === entry.id}
            onSelect={() => onMethod(entry.id)}
            title={entry.title}
            note={entry.note}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={method}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {method === "card" && (
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              <Field
                name="number"
                label="Card number"
                value={card.number}
                onChange={(next) => onCard({ ...card, number: formatCardNumber(next) })}
                error={errors.number}
                placeholder="4242 4242 4242 4242"
                autoComplete="cc-number"
                inputMode="numeric"
                maxLength={23}
                hint={brand ? brand : undefined}
                className="sm:col-span-2"
              />
              <Field
                name="name"
                label="Name on card"
                value={card.name}
                onChange={(next) => onCard({ ...card, name: next })}
                error={errors.name}
                placeholder="As printed"
                autoComplete="cc-name"
                className="sm:col-span-2"
              />
              <Field
                name="expiry"
                label="Expiry"
                value={card.expiry}
                onChange={(next) => onCard({ ...card, expiry: formatExpiry(next) })}
                error={errors.expiry}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
                maxLength={5}
              />
              <Field
                name="cvc"
                label="Security code"
                value={card.cvc}
                onChange={(next) => onCard({ ...card, cvc: next.replace(/\D/g, "").slice(0, 4) })}
                error={errors.cvc}
                placeholder={brand === "Amex" ? "4 digits" : "3 digits"}
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
              />

              <TestCards />
            </div>
          )}

          {(method === "telebirr" || method === "cbe") && (
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              <Field
                name="handset"
                label="Mobile number"
                value={handset}
                onChange={onHandset}
                error={errors.handset}
                placeholder="+251 9…"
                autoComplete="tel"
                inputMode="tel"
                className="sm:col-span-2"
              />
              <p className="lede sm:col-span-2">
                A prompt is pushed to that handset. The order is confirmed the moment it is
                approved — leave this page open while you do it.
              </p>
            </div>
          )}

          {method === "transfer" && (
            <div className="border-2 border-line bg-surface p-7">
              <p className="tag-sm text-accent">How it works</p>
              <p className="lede mt-5 max-w-xl">
                Placing the order reserves the print slot and emails you the transfer details and a
                reference. The queue starts when the funds land — usually the next business day for
                Interac, three to five for a wire.
              </p>
              <p className="mt-6 text-[12px] leading-snug text-faint">
                Nothing is charged now. The slot is held for seven days.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * The prototype's honesty note. The site says elsewhere that its forms do not
 * transmit; a payment screen has to say it louder, and the useful version of
 * saying it is handing over the numbers that walk each outcome.
 */
function TestCards() {
  return (
    <div className="border border-dashed border-line-strong p-6 sm:col-span-2">
      <p className="tag-sm text-accent">Prototype — no gateway is connected</p>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        Nothing entered here is transmitted or stored. Validation is real; the authorisation is
        simulated from the card number, so every outcome can be walked through:
      </p>
      <ul className="mt-5 flex flex-col gap-2">
        {testCards.map((entry) => (
          <li key={entry.number} className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[12px] text-fg">{entry.number}</span>
            <span className="tag-sm text-faint">{entry.outcome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
