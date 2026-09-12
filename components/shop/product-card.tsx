"use client";

import Link from "next/link";
import { Relic } from "@/components/shop/relic";
import { SaveButton } from "@/components/shop/bits";
import { Tilt } from "@/components/ui/surfaces";
import { money } from "@/lib/shop/format";
import { fromPrice } from "@/lib/shop/pricing";
import type { Product } from "@/lib/shop/catalog";
import { cn } from "@/lib/utils";

/**
 * One object in the grid. The whole card is the link; the save toggle sits
 * inside it and stops the event, which is the one place a nested control is
 * worth the trouble.
 */
export function ProductCard({
  product,
  index,
  className,
}: {
  product: Product;
  index: number;
  className?: string;
}) {
  const low = fromPrice(product);
  const configurable = product.materials.length > 1 || product.sizes.length > 1;

  return (
    <Tilt max={5} className={className}>
      <article className="card group/obj h-full">
        <Link href={`/store/${product.slug}`} className="block">
          <Relic
            kind={product.relic}
            src={product.image}
            variant={index + 1}
            className="aspect-4/5 border-0 border-b-2"
          />
        </Link>

        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="min-w-0">
            <Link href={`/store/${product.slug}`} className="block">
              <h3 className="text-[15px] leading-tight text-fg">{product.name}</h3>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{product.line}</p>
            </Link>
          </div>
          <SaveButton slug={product.slug} className="mt-0.5 shrink-0" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line px-6 py-4">
          <p className="text-[15px] tabular-nums text-fg">
            {configurable && <span className="tag-sm mr-2 text-faint">From</span>}
            {money(low)}
          </p>
          <span
            className={cn(
              "tag-sm transition-colors duration-500",
              product.digital ? "text-accent" : "text-faint group-hover/obj:text-accent",
            )}
          >
            {product.digital ? "Download" : product.collection}
          </span>
        </div>
      </article>
    </Tilt>
  );
}
