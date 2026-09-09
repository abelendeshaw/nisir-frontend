import type { Metadata } from "next";
import Link from "next/link";
import { Storefront } from "@/components/shop/storefront";
import { Relic } from "@/components/shop/relic";
import { Cta } from "@/components/sections/cta";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ArrowLink } from "@/components/ui/links";
import { Magnetic } from "@/components/ui/magnetic";
import { Marquee } from "@/components/ui/marquee";
import { collections, products } from "@/lib/shop/catalog";
import { money } from "@/lib/shop/format";
import { fromPrice } from "@/lib/shop/pricing";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Ethiopian form, printed in Ontario — rock-hewn crosses, Axum steles, jebena vessels and tibeb patterns, in stone composite, wood fibre and brass fill. Or upload your own model and price it live.",
};

const featured = products.filter((product) => product.featured).slice(0, 3);

export default function StorePage() {
  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-20 pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="grid-rails" aria-hidden />
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span>Shop</span>
              <span className="text-faint">{products.length} objects</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d0 mt-8"
            lines={[<>Ethiopia,</>, <>in <span className="thin text-gold">matter</span>.</>]}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-end">
            <Reveal immediate delay={0.5}>
              <p className="lede">
                Rock-hewn churches, Axum steles, coffee vessels and woven borders — reduced to
                geometry, printed in Ontario in stone composite, wood fibre and brass fill. Every
                object refers to something that already exists.
              </p>
            </Reveal>
            <Reveal immediate delay={0.62} className="flex flex-wrap items-center gap-5 lg:justify-end">
              <Magnetic strength={0.25}>
                <Link href="#objects" className="btn btn-solid">
                  Browse the objects
                </Link>
              </Magnetic>
              <ArrowLink href="/store/custom" className="tag">
                Or print your own
              </ArrowLink>
            </Reveal>
          </div>
        </div>

        {/* The collections, running edge to edge. */}
        <Reveal immediate delay={0.8} className="mt-16 border-y-2 border-line py-5">
          <Marquee duration={40} pauseOnHover>
            {collections.map((collection) => (
              <span key={collection} className="flex items-center gap-8 px-8">
                <span className="d4 text-fg/70">{collection}</span>
                <span className="size-1.5 rounded-full bg-gold" aria-hidden />
              </span>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* Three objects at scale, before the grid reduces them all to cards. */}
      <section className="py-20 md:py-28">
        <div className="shell">
          <div className="flex items-end justify-between gap-8 border-b-2 border-line pb-6">
            <p className="d3 max-w-[14ch]">
              Start <span className="thin text-gold">here</span>.
            </p>
            <Link href="#objects" className="tag-sm ul text-muted hover:text-accent">
              All {products.length}
            </Link>
          </div>

          <Stagger className="mt-10 grid gap-8 md:grid-cols-3" stagger={0.1}>
            {featured.map((product, i) => (
              <StaggerItem key={product.slug}>
                <Link href={`/store/${product.slug}`} className="group block">
                  <Relic
                    kind={product.relic}
                    variant={i * 3 + 1}
                    className="aspect-4/5"
                    label={product.collection}
                    index={product.number}
                  />
                  <div className="mt-6 flex items-baseline justify-between gap-5 border-t-2 border-line pt-5">
                    <div className="min-w-0">
                      <h2 className="d4 text-fg transition-colors duration-500 group-hover:text-accent">
                        {product.name}
                      </h2>
                      <p className="mt-3 text-[14px] leading-snug text-muted">{product.line}</p>
                    </div>
                    <p className="shrink-0 text-[15px] tabular-nums text-fg">
                      {money(fromPrice(product))}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Storefront />

      {/* The custom lane. */}
      <section className="slab-gold py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center lg:gap-24">
          <div>
            <Reveal>
              <p className="marker tag-sm">
                <span>Custom</span>
              </p>
            </Reveal>
            <Lines
              as="h2"
              className="d2 mt-7 max-w-[15ch]"
              lines={[<>Bring your own</>, <><span className="thin">geometry</span>.</>]}
            />
            <Reveal delay={0.2}>
              <p className="lede mt-9 max-w-xl">
                Upload an STL, OBJ, 3MF or PLY and see it on the bed at real scale. Material,
                infill, layer height, finish and queue position all move the price while you drag —
                because they all move what the machine is actually asked to do.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-11 flex flex-wrap items-center gap-5">
              <Magnetic strength={0.25}>
                <Link href="/store/custom" className="btn btn-solid">
                  Open the customiser
                </Link>
              </Magnetic>
              <ArrowLink href="/services/3d-modelling" className="tag">
                No model yet — have one made
              </ArrowLink>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <Relic kind="mesh" className="aspect-4/5" label="Your model" index="∞" />
          </Reveal>
        </div>
      </section>

      {/* What is true about buying here. */}
      <section className="py-20 md:py-28">
        <div className="shell">
          <Stagger className="grid gap-px border-t-2 border-line md:grid-cols-3" stagger={0.08}>
            {[
              {
                title: "Printed to order",
                body: "Nothing sits in a warehouse. Every object starts when you confirm, which is why lead times are stated in days rather than promised as tomorrow.",
              },
              {
                title: "Two studios",
                body: "Production and shipping run from Ontario; the forms, the research and the Academy are in Addis Ababa. Collection is possible at either.",
              },
              {
                title: "Repairable",
                body: "Send a broken piece back and we reprint the part, not the object. The models are ours and they do not go out of print.",
              },
            ].map((row, i) => (
              <StaggerItem key={row.title}>
                <div className="flex h-full flex-col gap-5 border-b-2 border-line py-8 md:border-b-0 md:pr-10">
                  <span className="tag-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="d4 text-fg">{row.title}</h3>
                  <p className="lede">{row.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Cta
        eyebrow="Something larger"
        lines={[<>A run, not</>, <>a <span className="thin text-gold">single</span>.</>]}
        href="/services/3d-printing"
        action="Brief a print run"
      />
    </main>
  );
}
