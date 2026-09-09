"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/shop/product-card";
import { categories, products, type Category } from "@/lib/shop/catalog";
import { fromPrice } from "@/lib/shop/pricing";
import { pluralise } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

type Sort = "featured" | "low" | "high" | "name";

const sorts: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price ↑" },
  { id: "high", label: "Price ↓" },
  { id: "name", label: "A–Z" },
];

/**
 * The grid, filtered.
 *
 * Fourteen objects is not enough to need a search index, so this is all local:
 * one category, one sort, and a count that tells the truth about what the
 * filters did. Cards keep their identity across a filter change, so the grid
 * re-flows rather than blinking.
 */
export function Storefront() {
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("featured");

  const shown = useMemo(() => {
    const filtered =
      category === "All" ? products : products.filter((p) => p.category === category);

    const sorted = [...filtered];
    switch (sort) {
      case "low":
        sorted.sort((a, b) => fromPrice(a) - fromPrice(b));
        break;
      case "high":
        sorted.sort((a, b) => fromPrice(b) - fromPrice(a));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort(
          (a, b) => Number(!!b.featured) - Number(!!a.featured) || a.number.localeCompare(b.number),
        );
    }
    return sorted;
  }, [category, sort]);

  return (
    <section id="objects" className="py-16 md:py-24">
      <div className="shell">
        {/* Controls sit on one rule, the way the service index does. */}
        <div className="flex flex-col gap-6 border-b-2 border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(["All", ...categories] as const).map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setCategory(entry)}
                aria-pressed={category === entry}
                className={cn(
                  "tag-sm rounded-full border px-4 py-2.5 transition-colors duration-300",
                  category === entry
                    ? "border-accent text-accent"
                    : "border-line text-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {entry}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <span className="tag-sm hidden text-faint sm:inline">
              {pluralise(shown.length, "object")}
            </span>
            <div className="flex items-center gap-4">
              {sorts.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSort(entry.id)}
                  aria-pressed={sort === entry.id}
                  className={cn(
                    "tag-sm ul transition-colors duration-300",
                    sort === entry.id ? "text-accent" : "text-faint hover:text-fg",
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div layout className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((product, i) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
