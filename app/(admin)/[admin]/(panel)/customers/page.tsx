import Form from "next/form";
import Link from "next/link";
import { button, control, Empty, Flag, PageHeader, Pagination, Table, Td, Th, dateTime } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import { money } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

export const generateMetadata = adminTitle("Customers");

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function CustomersPage({ params, searchParams }: PageProps<"/[admin]/customers">) {
  const context = await requireAdmin((await params).admin);
  const query = await searchParams;
  const q = one(query.q);
  const page = Math.max(1, Number(one(query.page)) || 1);

  const result = await adminData(context, (token) => api.customers(token, { q: q || undefined, page }));
  const root = `/${context.base}/customers`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Customers"
        title="Accounts"
        lede="Read-only. Spent counts paid and fulfilled orders. Admin rights are granted from the server's shell with php artisan nisir:admin, never from here."
      />

      <Form action={root} className="flex flex-wrap items-end gap-3">
        <input name="q" defaultValue={q} placeholder="Name or email" aria-label="Search customers" className={cn(control, "w-72")} />
        <button type="submit" className={cn(button.base, button.primary)}>
          Search
        </button>
        {q && (
          <Link href={root} className="tag-sm text-faint hover:text-fg">
            Clear
          </Link>
        )}
      </Form>

      {result.data.length === 0 ? (
        <Empty>No accounts match.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Joined</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Spent</Th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((customer) => (
              <tr key={customer.id} className="hover:bg-surface">
                <Td>
                  <span className="block font-semibold">
                    {customer.name}
                    {customer.role === "admin" && <span className="ml-2"><Flag>Admin</Flag></span>}
                  </span>
                  <a href={`mailto:${customer.email}`} className="block text-[12px] text-faint hover:text-fg">
                    {customer.email}
                  </a>
                </Td>
                <Td className="text-muted">{dateTime(customer.joinedAt)}</Td>
                <Td className="text-right tabular-nums">
                  {customer.orders > 0 ? (
                    <Link href={`/${context.base}/orders?q=${encodeURIComponent(customer.email)}`} className="hover:text-gold-deep">
                      {customer.orders}
                    </Link>
                  ) : (
                    0
                  )}
                </Td>
                <Td className="text-right tabular-nums">{money(customer.spentCents)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination
        page={result.meta.current_page}
        lastPage={result.meta.last_page}
        total={result.meta.total}
        href={(target) => `${root}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(target) })}`}
      />
    </div>
  );
}
