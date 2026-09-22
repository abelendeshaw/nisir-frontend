import Form from "next/form";
import Link from "next/link";
import { button, control, Empty, Flag, PageHeader, Pagination, StatusBadge, Table, Td, Th, dateTime } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { money } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

export const generateMetadata = adminTitle("Orders");

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function OrdersPage({ params, searchParams }: PageProps<"/[admin]/orders">) {
  const context = await requireAdmin((await params).admin);
  const query = await searchParams;

  const status = one(query.status);
  const q = one(query.q);
  const review = one(query.review) === "1";
  const page = Math.max(1, Number(one(query.page)) || 1);

  const result = await adminData(context, (token) =>
    api.orders(token, {
      status: ORDER_STATUSES.some((entry) => entry.id === status) ? status : undefined,
      q: q || undefined,
      review: review || undefined,
      page,
    }),
  );

  const root = `/${context.base}/orders`;
  const pageHref = (target: number) => {
    const next = new URLSearchParams();
    if (status) next.set("status", status);
    if (q) next.set("q", q);
    if (review) next.set("review", "1");
    next.set("page", String(target));
    return `${root}?${next.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Orders" title="Orders" lede="Newest first. Search by order number, customer name or email." />

      {/* A GET form: the filters live in the URL, so a filtered list can be bookmarked or sent to someone. */}
      <Form action={root} className="flex flex-wrap items-end gap-3">
        <input name="q" defaultValue={q} placeholder="NSR-4KX92B, name or email" aria-label="Search orders" className={cn(control, "w-72")} />
        <select name="status" defaultValue={status} aria-label="Status" className={cn(control, "w-auto")}>
          <option value="">Every status</option>
          {ORDER_STATUSES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 text-[14px]">
          <input type="checkbox" name="review" value="1" defaultChecked={review} className="size-4 accent-[var(--gold-deep)]" />
          Needs review
        </label>
        <button type="submit" className={cn(button.base, button.primary)}>
          Filter
        </button>
        {(status || q || review) && (
          <Link href={root} className="tag-sm text-faint hover:text-fg">
            Clear
          </Link>
        )}
      </Form>

      {result.data.length === 0 ? (
        <Empty>No orders match.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((order) => (
              <tr key={order.id} className="hover:bg-surface">
                <Td>
                  <Link href={`${root}/${order.id}`} className="font-semibold hover:text-gold-deep">
                    {order.id}
                  </Link>
                  <span className="block text-[12px] text-faint">{dateTime(order.placedAt)}</span>
                </Td>
                <Td>
                  <span className="block">{order.customer.name}</span>
                  <span className="block text-[12px] text-faint">
                    {order.customer.email}
                    {order.customer.guest && " · guest"}
                  </span>
                </Td>
                <Td className="tabular-nums">
                  {order.itemCount}
                  {order.needsReview && <span className="ml-2"><Flag tone="warn">Review</Flag></span>}
                </Td>
                <Td className="text-muted">{order.paymentMethod}</Td>
                <Td><StatusBadge status={order.status} label={order.statusLabel} /></Td>
                <Td className="text-right tabular-nums">{money(order.totalCents)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} total={result.meta.total} href={pageHref} />
    </div>
  );
}
