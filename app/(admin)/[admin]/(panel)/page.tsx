import Link from "next/link";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Empty, Flag, PageHeader, Panel, Stat, StatusBadge, Table, Td, Th, dateTime } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import { money, pluralise } from "@/lib/shop/format";

export const generateMetadata = adminTitle("Dashboard");

/** "+12% on the 30 days before", or nothing when there is no base to compare with. */
function change(current: number, previous: number): string | undefined {
  if (previous === 0) return current === 0 ? undefined : "Nothing in the 30 days before";
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent >= 0 ? "+" : "−"}${Math.abs(percent)}% on the 30 days before`;
}

export default async function DashboardPage({ params }: PageProps<"/[admin]">) {
  const context = await requireAdmin((await params).admin);
  const data = await adminData(context, api.dashboard);
  const root = `/${context.base}`;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={`Last ${data.windowDays} days`}
        title={<>Hello, {context.session.name.split(" ")[0]}</>}
        lede="Revenue counts paid and fulfilled orders only — money that has arrived, not money that has been promised."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue" value={money(data.revenueCents)} detail={change(data.revenueCents, data.previousRevenueCents)} />
        <Stat label="Orders" value={data.orders} detail={change(data.orders, data.previousOrders)} href={`${root}/orders`} />
        <Stat
          label="Awaiting payment"
          value={data.awaitingPayment}
          detail={data.needsReview > 0 ? `${pluralise(data.needsReview, "model")} to review` : "Nothing flagged for review"}
          href={`${root}/orders?status=pending_payment`}
        />
        <Stat label="Customers" value={data.customers} href={`${root}/customers`} />
      </div>

      <Panel title="Revenue by day">
        <RevenueChart days={data.revenueByDay} />
      </Panel>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Recent orders" actions={<Link href={`${root}/orders`} className="tag-sm text-faint hover:text-fg">All orders</Link>}>
          {data.recentOrders.length === 0 ? (
            <Empty>No orders yet.</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface">
                    <Td>
                      <Link href={`${root}/orders/${order.id}`} className="font-semibold hover:text-gold-deep">
                        {order.id}
                      </Link>
                      <span className="block text-[12px] text-faint">{dateTime(order.placedAt)}</span>
                    </Td>
                    <Td>
                      {order.customer.name}
                      {order.needsReview && <span className="ml-2"><Flag tone="warn">Review</Flag></span>}
                    </Td>
                    <Td><StatusBadge status={order.status} label={order.statusLabel} /></Td>
                    <Td className="text-right tabular-nums">{money(order.totalCents)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        <div className="flex flex-col gap-8">
          <Panel title="Top sellers" actions={<Link href={`${root}/best-sellers`} className="tag-sm text-faint hover:text-fg">Full ranking</Link>}>
            {data.topSellers.length === 0 ? (
              <Empty>Nothing sold in this window yet.</Empty>
            ) : (
              <ol className="flex flex-col divide-y divide-[var(--line)]">
                {data.topSellers.map((seller) => (
                  <li key={seller.slug} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="min-w-0 truncate">
                      <span className="mr-3 tabular-nums text-faint">{seller.rank}</span>
                      {seller.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">{pluralise(seller.units, "unit")}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title="Running low" actions={<Link href={`${root}/products?stock=low`} className="tag-sm text-faint hover:text-fg">Inventory</Link>}>
            {data.lowStock.length === 0 ? (
              <Empty>Every product is well stocked.</Empty>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--line)]">
                {data.lowStock.map((product) => (
                  <li key={product.slug} className="flex items-baseline justify-between gap-4 py-2.5">
                    <Link href={`${root}/products/${product.slug}`} className="min-w-0 truncate hover:text-gold-deep">
                      {product.name}
                    </Link>
                    <span className="shrink-0 tabular-nums text-gold-deep">
                      {product.stock === 0 ? "Sold out" : `${product.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
