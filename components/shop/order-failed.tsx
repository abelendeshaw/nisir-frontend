"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lines, Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { Mark } from "@/components/chrome/mark";
import { money } from "@/lib/shop/format";
import { declineFromCode } from "@/lib/shop/payment";
import { useCart } from "@/lib/shop/store";
import { site } from "@/lib/site";

/**
 * The unhappy path, given the same care as the happy one.
 *
 * Three things matter here and nothing else does: nobody was charged, the cart
 * is exactly as it was, and there is one obvious way back. A decline is not an
 * error state — it is a normal thing banks do — so the page does not apologise
 * or shout.
 */
export function OrderFailed() {
  const params = useSearchParams();
  const decline = declineFromCode(params.get("code"));
  const cart = useCart();

  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[12%] top-[10%] block w-[54vw] max-w-[640px] text-bone/[0.035]"
        >
          <Mark className="w-full" />
        </span>
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span className="text-accent">Not completed</span>
              <span className="font-mono text-faint">{decline.code}</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[14ch]"
            lines={[<>Nothing was</>, <><span className="thin text-gold">charged</span>.</>]}
          />
          <Reveal immediate delay={0.45}>
            <p className="lede mt-9 max-w-xl">
              <span className="text-fg">{decline.title}.</span> {decline.detail}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="marker tag-sm">
              <span>Where things stand</span>
            </p>
          </Reveal>

          <div>
            <ul className="grid gap-px border-t-2 border-line">
              {[
                {
                  title: "No money moved",
                  body: "The authorisation failed before any charge was made. If your banking app shows a pending hold, it clears on its own within a few days.",
                },
                {
                  title: `Your cart is intact — ${cart.count} item${cart.count === 1 ? "" : "s"}, ${money(cart.subtotalCents)}`,
                  body: "Nothing was removed and nothing was reserved. Picking up where you left off costs one click.",
                },
                {
                  title: decline.retryable ? "Worth trying again" : "Try a different card",
                  body: decline.retryable
                    ? "This one was a timeout on the processor's side rather than a decision by your bank."
                    : "Banks do not tell merchants why they decline, so we genuinely cannot say more than this. Another card usually clears immediately.",
                },
              ].map((row, i) => (
                <Reveal as="li" key={row.title} delay={0.06 * i}>
                  <span className="flex gap-6 border-b border-line py-6">
                    <span className="tag-sm w-8 shrink-0 pt-1 text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] text-fg">{row.title}</span>
                      <span className="lede mt-2 block max-w-xl">{row.body}</span>
                    </span>
                  </span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.2} className="mt-12 flex flex-wrap items-center gap-6">
              <Magnetic strength={0.2}>
                <Link href="/store/checkout" className="btn btn-solid">
                  Back to checkout
                </Link>
              </Magnetic>
              <Link href="/store/cart" className="tag-sm ul text-muted hover:text-accent">
                Review the cart
              </Link>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent("Payment trouble")}`}
                className="tag-sm ul text-muted hover:text-accent"
              >
                Ask a person
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
