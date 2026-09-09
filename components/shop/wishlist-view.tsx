"use client";

import { Fragment } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Relic } from "@/components/shop/relic";
import { Empty } from "@/components/shop/bits";
import { Lines, Reveal } from "@/components/ui/reveal";
import { money, pluralise } from "@/lib/shop/format";
import { getProduct, optionsFor } from "@/lib/shop/catalog";
import {
  configuredPrice,
  defaultConfiguration,
  describeConfiguration,
  lineId,
} from "@/lib/shop/pricing";
import { openCart, useCart, useWishlist } from "@/lib/shop/store";

/**
 * Saved objects.
 *
 * A wishlist that cannot become a cart is a bookmark bar. Each row moves in one
 * click, at the object's default configuration — which is also the cheapest, so
 * nothing gets silently upsold on the way across.
 */
export function WishlistView() {
  const wishlist = useWishlist();
  const cart = useCart();

  const saved = wishlist.slugs
    .map((slug) => getProduct(slug))
    .filter((product): product is NonNullable<typeof product> => !!product);

  function moveToCart(slug: string) {
    const product = getProduct(slug);
    if (!product) return;
    const config = defaultConfiguration(product);
    cart.add({
      id: lineId(product.slug, config),
      kind: "catalogue",
      slug: product.slug,
      name: product.name,
      line: product.line,
      relic: product.relic,
      unitCents: configuredPrice(product, config),
      qty: 1,
      digital: !!product.digital,
      options: describeConfiguration(product, config),
    });
    wishlist.remove(slug);
    openCart();
  }

  return (
    <main id="main">
      <section className="slab-ink pb-14 pt-[calc(var(--header-h)+clamp(40px,8vh,96px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/store" className="ul transition-colors hover:text-accent">
                Shop
              </Link>
              <span className="text-faint">Saved</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.1}
            className="d1 mt-8"
            lines={[
              <Fragment key="a">Kept</Fragment>,
              <Fragment key="b">
                for <span className="thin text-gold">later</span>.
              </Fragment>,
            ]}
          />
          <Reveal immediate delay={0.4}>
            <p className="lede mt-8 max-w-lg">
              {saved.length === 0
                ? "Nothing saved yet — the diamond on any object keeps it here."
                : `${pluralise(saved.length, "object")}, held on this device. Nothing is reserved until it is in the cart.`}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="shell">
          {saved.length === 0 ? (
            <Empty
              eyebrow="Nothing saved"
              title={
                <>
                  An empty <span className="thin text-gold">shelf</span>.
                </>
              }
              body="Save an object with the diamond on its card and it waits here until you decide."
            />
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-4 border-b-2 border-line pb-4">
                <p className="tag-sm text-faint">{pluralise(saved.length, "object")}</p>
                <button
                  type="button"
                  onClick={wishlist.clear}
                  className="tag-sm ul text-faint transition-colors hover:text-accent"
                >
                  Clear all
                </button>
              </div>

              <AnimatePresence initial={false} mode="popLayout">
                {saved.map((product) => {
                  const config = defaultConfiguration(product);
                  const configurable = optionsFor(product).materials.length > 1;
                  return (
                    <motion.article
                      key={product.slug}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col gap-5 border-b border-line py-7 sm:flex-row sm:items-center"
                    >
                      <Link href={`/store/${product.slug}`} className="w-24 shrink-0 sm:w-28">
                        <Relic kind={product.relic} className="aspect-4/5" quiet />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link href={`/store/${product.slug}`} className="ul text-[15px] text-fg">
                          {product.name}
                        </Link>
                        <p className="mt-1.5 text-[13px] leading-snug text-muted">{product.line}</p>
                        <p className="mt-3 text-[15px] tabular-nums text-fg">
                          {configurable && <span className="tag-sm mr-2 text-faint">From</span>}
                          {money(configuredPrice(product, config))}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-5">
                        <button
                          type="button"
                          onClick={() => moveToCart(product.slug)}
                          className="btn h-12 px-6"
                        >
                          Move to cart
                        </button>
                        <button
                          type="button"
                          onClick={() => wishlist.remove(product.slug)}
                          className="tag-sm ul text-faint transition-colors hover:text-accent"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
