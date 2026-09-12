"use client";

import { useState } from "react";
import Link from "next/link";
import { Relic } from "@/components/shop/relic";
import { Chip, OptionGroup, SaveButton, Stat, Stepper } from "@/components/shop/bits";
import { ProductCard } from "@/components/shop/product-card";
import { Lines, Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { ArrowLink } from "@/components/ui/links";
import { grams, leadTime, millimetres, money } from "@/lib/shop/format";
import {
  configuredPrice,
  defaultConfiguration,
  describeConfiguration,
  lineId,
  type Configuration,
} from "@/lib/shop/pricing";
import { optionsFor, sizeById, type Product } from "@/lib/shop/catalog";
import { openCart, useCart } from "@/lib/shop/store";

/**
 * One object, at length.
 *
 * The configurator is the price. Every chip shows what choosing it does to the
 * number — a delta, live, against whatever is currently selected — because the
 * alternative is a shopper clicking through six combinations to find out.
 */
export function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const [config, setConfig] = useState<Configuration>(() => defaultConfiguration(product));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const cart = useCart();

  const { materials, finishes, sizes } = optionsFor(product);
  const unit = configuredPrice(product, config);
  const size = sizeById.get(config.size);
  const scale = size?.scale ?? 1;

  /** What switching one option would do, from where we are now. */
  const delta = (patch: Partial<Configuration>) =>
    configuredPrice(product, { ...config, ...patch }) - unit;

  function deltaLabel(patch: Partial<Configuration>) {
    const difference = delta(patch);
    if (difference === 0) return null;
    return `${difference > 0 ? "+" : "−"}${money(Math.abs(difference))}`;
  }

  function addToCart() {
    cart.add({
      id: lineId(product.slug, config),
      kind: "catalogue",
      slug: product.slug,
      name: product.name,
      line: product.line,
      relic: product.relic,
      unitCents: unit,
      qty,
      digital: !!product.digital,
      options: describeConfiguration(product, config),
    });
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 2600);
  }

  return (
    <main id="main">
      <section className="slab-ink pb-16 pt-[calc(var(--header-h)+clamp(40px,8vh,96px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/store" className="ul transition-colors hover:text-accent">
                Shop
              </Link>
              <span className="text-faint">{product.collection}</span>
              <span className="text-faint">{product.number}</span>
            </p>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
            {/* The figure. Sticky, because the configurator is the long column. */}
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
              <Relic
                kind={product.relic}
                src={product.image}
                // Real alt text here, unlike on a card: this figure is the
                // content of the page rather than an illustration beside it.
                alt={product.image ? `${product.name} — ${product.line}` : ""}
                className="aspect-4/5 w-full"
                label={product.collection}
                index={product.number}
              />
              {/*
                The caption has to follow the figure. Saying "drawn, not
                photographed" under an actual render of the object is worse
                than saying nothing — and the honest note for a render is that
                it is a render, not a photograph of a finished print.
              */}
              <p className="mt-4 text-[12px] leading-snug text-faint">
                {product.image
                  ? "Rendered from the print model — the geometry is the object's own. Photography of a finished print follows the first production run."
                  : "Drawn, not photographed — the figure is of the source the object refers to. Print photography lands with the first production run."}
              </p>
            </div>

            <div className="min-w-0">
              <Lines
                as="h1"
                immediate
                delay={0.08}
                className="d2"
                lines={product.name.split(" — ").map((part, i, all) => (
                  <span key={part}>
                    {part}
                    {i < all.length - 1 ? " —" : ""}
                  </span>
                ))}
              />
              <Reveal immediate delay={0.32}>
                <p className="lede mt-6">{product.line}</p>

                <p className="d4 mt-10 tabular-nums text-fg">
                  {money(unit)}
                  <span className="tag-sm ml-3 align-middle text-faint">CAD</span>
                </p>

                <div className="mt-10 flex flex-col gap-8">
                  <OptionGroup label="Material">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {materials.map((material) => (
                        <Chip
                          key={material.id}
                          selected={config.material === material.id}
                          onClick={() => setConfig({ ...config, material: material.id })}
                          swatch={material.swatch}
                          note={
                            <>
                              {material.note}
                              {deltaLabel({ material: material.id }) && (
                                <span className="ml-1 text-accent">
                                  {deltaLabel({ material: material.id })}
                                </span>
                              )}
                            </>
                          }
                        >
                          {material.name}
                        </Chip>
                      ))}
                    </div>
                  </OptionGroup>

                  <OptionGroup label="Finish">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {finishes.map((finish) => (
                        <Chip
                          key={finish.id}
                          selected={config.finish === finish.id}
                          onClick={() => setConfig({ ...config, finish: finish.id })}
                          note={
                            <>
                              {finish.note}
                              {deltaLabel({ finish: finish.id }) && (
                                <span className="ml-1 text-accent">
                                  {deltaLabel({ finish: finish.id })}
                                </span>
                              )}
                            </>
                          }
                        >
                          {finish.name}
                        </Chip>
                      ))}
                    </div>
                  </OptionGroup>

                  {!product.digital && sizes.length > 1 && (
                    <OptionGroup label="Size" hint={millimetres(product.dimsMm, scale)}>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {sizes.map((entry) => (
                          <Chip
                            key={entry.id}
                            selected={config.size === entry.id}
                            onClick={() => setConfig({ ...config, size: entry.id })}
                            note={
                              <>
                                {entry.note}
                                {deltaLabel({ size: entry.id }) && (
                                  <span className="ml-1 text-accent">
                                    {deltaLabel({ size: entry.id })}
                                  </span>
                                )}
                              </>
                            }
                          >
                            {entry.name}
                          </Chip>
                        ))}
                      </div>
                    </OptionGroup>
                  )}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Stepper value={qty} onChange={setQty} label="Quantity" max={Math.min(99, product.stock)} />
                  <Magnetic strength={0.2}>
                    <button type="button" onClick={addToCart} className="btn btn-solid">
                      {added ? "Added" : `Add — ${money(unit * qty)}`}
                    </button>
                  </Magnetic>
                  <SaveButton slug={product.slug} withLabel className="ml-1" />
                </div>

                <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-line pt-8 sm:grid-cols-3">
                  <Stat label="Lead time" value={leadTime(product.leadDays)} />
                  {!product.digital && (
                    <>
                      <Stat label="Dimensions" value={millimetres(product.dimsMm, scale)} />
                      <Stat label="Weight" value={grams(product.weightG * scale ** 3)} />
                    </>
                  )}
                  <Stat
                    label="Availability"
                    value={
                      product.digital
                        ? "Unlimited"
                        : product.stock > 15
                          ? "In stock"
                          : `${product.stock} left`
                    }
                  />
                  <Stat label="Made in" value={product.digital ? "Modelled in Addis" : "Ontario"} />
                  <Stat label="Collection" value={product.collection} />
                </dl>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* The source, and what is true about the object. */}
      <section className="py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="marker tag-sm">
              <span>The source</span>
            </p>
          </Reveal>
          <div>
            <Reveal delay={0.08}>
              <p className="d4 max-w-[26ch] text-fg">{product.line}</p>
              <p className="lede mt-8 max-w-2xl">{product.story}</p>
            </Reveal>
            <ul className="mt-12 grid gap-px border-t border-line">
              {product.notes.map((note, i) => (
                <Reveal as="li" key={note} delay={0.1 + i * 0.06}>
                  <span className="flex items-baseline gap-5 border-b border-line py-4">
                    <span className="tag-sm w-8 shrink-0 text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] text-muted">{note}</span>
                  </span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.2} className="mt-12">
              <ArrowLink href="/store/custom" className="tag">
                Want it different — upload your own model
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="slab-ink py-20 md:py-28">
          <div className="shell">
            <div className="flex items-end justify-between gap-8 border-b-2 border-line pb-6">
              <p className="d3 max-w-[12ch]">
                Also <span className="thin text-gold">cast</span>.
              </p>
              <Link href="/store" className="tag-sm ul text-muted hover:text-accent">
                All objects
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry, i) => (
                <ProductCard key={entry.slug} product={entry} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
