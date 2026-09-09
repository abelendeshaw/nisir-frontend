"use client";

import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { LineRow } from "@/components/shop/line-row";
import { PromoField, Summary, useAppliedPromo } from "@/components/shop/summary";
import { Empty } from "@/components/shop/bits";
import { Lines, Reveal } from "@/components/ui/reveal";
import { ArrowLink } from "@/components/ui/links";
import { calculateTotals } from "@/lib/shop/pricing";
import { pluralise } from "@/lib/shop/format";
import { useCart } from "@/lib/shop/store";

/**
 * The cart at length. Shipping and tax here are an Ontario estimate and are
 * labelled as one — the real numbers need a destination, and inventing them
 * before the address step is how a total ends up moving under someone.
 */
export function CartView() {
  const cart = useCart();
  const promo = useAppliedPromo(cart.subtotalCents);
  const totals = calculateTotals(cart.lines, { zone: "ca", shipping: "standard", promo });

  return (
    <main id="main">
      <section className="slab-ink pb-14 pt-[calc(var(--header-h)+clamp(40px,8vh,96px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/store" className="ul transition-colors hover:text-accent">
                Shop
              </Link>
              <span className="text-faint">Cart</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.1}
            className="d1 mt-8"
            lines={[<>Your</>, <>cart<span className="thin text-gold">.</span></>]}
          />
          <Reveal immediate delay={0.4}>
            <p className="lede mt-8 max-w-lg">
              {cart.count === 0
                ? "Nothing here yet."
                : `${pluralise(cart.count, "item")}, printed to order in Ontario once you confirm.`}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="shell">
          {cart.lines.length === 0 ? (
            <Empty
              eyebrow="Empty"
              title={
                <>
                  Nothing in the <span className="thin text-gold">cart</span>.
                </>
              }
              body="Fourteen objects drawn from Ethiopian form, plus anything you care to upload and have printed."
            />
          ) : (
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-4 border-b-2 border-line pb-4">
                  <p className="tag-sm text-faint">{pluralise(cart.lines.length, "line")}</p>
                  <button
                    type="button"
                    onClick={cart.clear}
                    className="tag-sm ul text-faint transition-colors hover:text-accent"
                  >
                    Empty the cart
                  </button>
                </div>

                <AnimatePresence initial={false} mode="popLayout">
                  {cart.lines.map((line) => (
                    <LineRow
                      key={line.id}
                      line={line}
                      onQty={(qty) => cart.setQty(line.id, qty)}
                      onRemove={() => cart.remove(line.id)}
                    />
                  ))}
                </AnimatePresence>

                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <ArrowLink href="/store" className="tag">
                    Keep browsing
                  </ArrowLink>
                  <ArrowLink href="/store/custom" className="tag">
                    Print something of your own
                  </ArrowLink>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
                <PromoField subtotalCents={cart.subtotalCents} />
                <Summary totals={totals} promo={promo} zone="ca" estimated shippingLabel="Shipping — Ontario estimate">
                  <Link href="/store/checkout" className="btn btn-solid w-full">
                    Checkout
                  </Link>
                  <p className="text-[12px] leading-snug text-faint">
                    Shipping and tax are recalculated once you choose a destination.
                  </p>
                </Summary>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
