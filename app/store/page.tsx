import type { Metadata } from "next";
import { Cta } from "@/components/sections/cta";
import { Plate } from "@/components/ui/plate";
import { Tilt } from "@/components/ui/surfaces";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ArrowLink } from "@/components/ui/links";
import type { PlateKind } from "@/lib/services";

export const metadata: Metadata = {
  title: "Store",
  description:
    "A concept storefront for Nisir — 3D-printed physical objects and downloadable digital models. Commerce is parked until the product build.",
};

/**
 * The storefront is deliberately parked. Accounts, checkout, payment, digital
 * fulfilment and verified reviews are upstream product work; this page carries
 * the concept forward in the new system without pretending to transact.
 */
const objects: { name: string; kind: PlateKind; type: string }[] = [
  { name: "Physical object", kind: "orbit", type: "Printed · Ontario" },
  { name: "Digital model", kind: "lattice", type: "Download · STL / STEP" },
  { name: "Seasonal edition", kind: "solid", type: "Limited run" },
  { name: "Prototype series", kind: "stack", type: "Small batch" },
];

const pending = [
  "Account-gated checkout",
  "Payment processing",
  "Digital asset fulfilment",
  "Verified reviews",
  "Order tracking",
];

export default function StorePage() {
  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="grid-rails" aria-hidden />
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span>Store</span>
              <span className="text-faint">Concept</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[11ch]"
            lines={[<>Objects,</>, <>ready to <span className="thin text-gold">exist</span>.</>]}
          />
          <Reveal immediate delay={0.5} className="mt-10">
            <p className="lede max-w-xl">
              A future storefront for 3D-printed physical goods and downloadable digital models.
              Checkout stays deliberately separate from studio inquiries — buying an object and
              commissioning one are not the same conversation.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="shell">
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {objects.map((object, i) => (
              <StaggerItem key={object.name}>
                <Tilt max={7}>
                  <article className="card group/obj h-full">
                    <Plate kind={object.kind} className="aspect-4/5 border-0 border-b" />
                    <div className="flex items-baseline justify-between gap-4 p-6">
                      <div>
                        <p className="text-[15px] text-fg">{object.name}</p>
                        <p className="mt-1.5 text-[13px] text-muted">{object.type}</p>
                      </div>
                      <span className="tag-sm text-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-line px-6 py-4">
                      <span className="tag-sm text-faint">Not yet listed</span>
                      <span className="tag-sm text-accent opacity-0 transition-opacity duration-500 group-hover/obj:opacity-100">
                        Soon
                      </span>
                    </div>
                  </article>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="slab-ink py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="marker tag-sm">
              <span>Honest status</span>
            </p>
            <p className="d3 mt-6 max-w-[13ch]">
              Commerce, not a <span className="thin text-gold">page</span>.
            </p>
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <p className="lede max-w-xl">
                The transactional layer is parked until the product build. Everything below is
                still to come — listed here rather than implied by a disabled button.
              </p>
            </Reveal>

            <Stagger className="mt-10 flex flex-wrap gap-2" stagger={0.05}>
              {pending.map((item) => (
                <StaggerItem key={item}>
                  <span className="tag-sm inline-flex rounded-full border border-dashed border-line-strong px-4 py-2.5 text-muted">
                    {item}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.15} className="mt-14">
              <ArrowLink href="/services/3d-printing" className="tag">
                Need something made now — Custom 3D Printing
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </section>

      <Cta
        eyebrow="Commission instead"
        lines={[<>Have it</>, <>made to <span className="thin text-gold">order</span>.</>]}
        href="/services/3d-printing"
        action="Brief a print run"
      />
    </main>
  );
}
