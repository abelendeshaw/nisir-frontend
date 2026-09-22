import Link from "next/link";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { Empty, Flag, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import { money } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

export const generateMetadata = adminTitle("Best sellers");

const WINDOWS: { days: number | null; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "A year" },
  { days: null, label: "All time" },
];

export default async function BestSellersPage({ params, searchParams }: PageProps<"/[admin]/best-sellers">) {
  const context = await requireAdmin((await params).admin);
  // `?days=0` is "all time" — the API's absence of a window.
  const requested = Number((await searchParams).days);
  const days = WINDOWS.some((window) => (window.days ?? 0) === requested) ? requested : 30;

  const { sellers } = await adminData(context, (token) => api.bestSellers(token, days === 0 ? null : days));
  const root = `/${context.base}`;
  const featuredCount = sellers.filter((seller) => seller.product?.featured).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Best sellers"
        title="What sells"
        lede={
          <>
            Catalogue products ranked by units sold, counting orders that were placed and not called off. Tick
            <strong className="font-semibold text-fg"> Featured </strong>
            to put a product first in the shop — the storefront opens on up to three featured pieces.
          </>
        }
      />

      <nav aria-label="Window" className="flex flex-wrap gap-2">
        {WINDOWS.map((window) => {
          const value = window.days ?? 0;
          const active = value === days;
          return (
            <Link
              key={window.label}
              href={`${root}/best-sellers?days=${value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "tag-sm border-2 px-3 py-2 transition-colors",
                active ? "border-ink bg-ink text-bone" : "border-line text-muted hover:border-fg hover:text-fg",
              )}
            >
              {window.label}
            </Link>
          );
        })}
      </nav>

      {sellers.length === 0 ? (
        <Empty>Nothing sold in this window.</Empty>
      ) : (
        <>
          <p className="text-[13px] text-muted">{featuredCount} of these are featured.</p>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Product</Th>
                <Th className="text-right">Units</Th>
                <Th className="text-right">Orders</Th>
                <Th className="text-right">Revenue</Th>
                <Th>Stock</Th>
                <Th>Featured</Th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.slug} className="hover:bg-surface">
                  <Td className="tabular-nums text-faint">{seller.rank}</Td>
                  <Td>
                    {seller.product ? (
                      <Link href={`${root}/products/${seller.slug}`} className="font-semibold hover:text-gold-deep">
                        {seller.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{seller.name}</span>
                    )}
                    {seller.product && !seller.product.active && <span className="ml-2"><Flag>Retired</Flag></span>}
                    {!seller.product && <span className="ml-2"><Flag>No longer in the catalogue</Flag></span>}
                  </Td>
                  <Td className="text-right tabular-nums">{seller.units}</Td>
                  <Td className="text-right tabular-nums">{seller.orders}</Td>
                  <Td className="text-right tabular-nums">{money(seller.revenueCents)}</Td>
                  <Td className="tabular-nums">
                    {!seller.product ? "—" : seller.product.digital ? <Flag>Digital</Flag> : (
                      <span className={cn(seller.product.lowStock && "font-semibold text-gold-deep")}>{seller.product.stock}</span>
                    )}
                  </Td>
                  <Td>
                    {seller.product ? (
                      <FlagToggle slug={seller.slug} flag="featured" value={seller.product.featured} label={`Feature ${seller.name}`} />
                    ) : null}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
