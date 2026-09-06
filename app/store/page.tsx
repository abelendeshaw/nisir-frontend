import type { Metadata } from "next";
import Link from "next/link";
import { EagleMark } from "@/components/brand";
import { SkyScene } from "@/components/sky";
import { MaskLines, Reveal, RevealGroup } from "@/components/motion";
import { SpotlightCard } from "@/components/spotlight-card";

export const metadata: Metadata = {
  title: "3D Store",
  description:
    "A concept storefront for Nisir Designs — physical 3D-printed products and downloadable digital models.",
};

/**
 * The storefront is deliberately parked: the commerce model (accounts,
 * checkout, payment, digital fulfilment, verified reviews) is still upstream
 * work. This page only carries the concept forward in the new visual system.
 */
const products = ["Physical product", "Digital model", "Seasonal object", "Prototype series"];

const pending = [
  "Account-gated checkout",
  "Stripe payment",
  "Digital asset fulfilment",
  "Verified reviews",
  "Storefront assistant",
];

export default function StorePage() {
  return (
    <main id="top">
      <section className="relative isolate flex min-h-[72svh] flex-col justify-end overflow-hidden pb-14 pt-36">
        <SkyScene compact />
        <div className="shell relative">
          <Reveal immediate y={14}>
            <p className="eyebrow">3D storefront · Concept</p>
          </Reveal>
          <MaskLines
            immediate
            className="display display-xl mt-7 max-w-[12ch]"
            delay={0.12}
            lines={[<>Objects,</>, <><span className="text-gradient-gold">ready to exist.</span></>]}
          />
          <Reveal immediate delay={0.45} y={20} className="mt-9">
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              A future storefront for physical 3D-printed products and downloadable digital
              models. Checkout stays deliberately separate from guest service inquiries.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Reveal y={14}>
                <p className="eyebrow">Store architecture</p>
              </Reveal>
              <MaskLines
                as="h2"
                className="display display-lg mt-6 max-w-[16ch]"
                lines={[<>Designed as commerce,</>, <>not a <span className="text-gradient-gold">capability page.</span></>]}
              />
            </div>
            <Reveal delay={0.15} className="max-w-sm lg:pb-3">
              <p className="text-muted">
                The transactional layer is parked until the product build. What is here keeps the
                store visually connected to the rest of the brand.
              </p>
            </Reveal>
          </div>

          <RevealGroup className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {products.map((product, index) => (
              <SpotlightCard key={product} className="card sheen group/tile rounded-2xl">
                <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-6">
                  <span className="label text-[10px] text-subtle">
                    Slot {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-2xl transition-transform duration-700 group-hover/tile:-translate-y-1">
                    {product}
                  </span>
                </div>
                <EagleMark className="pointer-events-none absolute -bottom-6 -right-6 w-28 opacity-[0.05]" />
              </SpotlightCard>
            ))}
          </RevealGroup>

          <Reveal delay={0.1} className="mt-16">
            <div className="hairline" />
            <div className="grid gap-8 pt-10 md:grid-cols-[auto_1fr] md:gap-16">
              <p className="label text-[10px] text-subtle">Still to build</p>
              <ul className="flex flex-wrap gap-2">
                {pending.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-dashed border-line-strong px-3.5 py-2 text-[12px] text-subtle"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-16">
            <Link
              href="/capabilities/3d-printing"
              className="group flex flex-col gap-6 border-t border-line pt-10 transition-colors duration-500 hover:border-accent sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <span className="label text-[10px] text-subtle">Need something made · 06</span>
                <p className="display display-md mt-4 transition-transform duration-700 group-hover:translate-x-2">
                  Custom 3D Printing
                </p>
              </div>
              <span className="text-4xl text-accent transition-transform duration-700 group-hover:-translate-y-1 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
