import Form from "next/form";
import Link from "next/link";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { StockControl } from "@/components/admin/stock-control";
import { button, control, Empty, Flag, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import { money } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

export const generateMetadata = adminTitle("Inventory");

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function InventoryPage({ params, searchParams }: PageProps<"/[admin]/products">) {
  const context = await requireAdmin((await params).admin);
  const query = await searchParams;

  const q = one(query.q);
  const status = ["active", "inactive"].includes(one(query.status)) ? one(query.status) : "";
  const stock = ["low", "out"].includes(one(query.stock)) ? one(query.stock) : "";

  const products = await adminData(context, (token) =>
    api.products(token, { q: q || undefined, status: status || undefined, stock: stock || undefined }),
  );

  const root = `/${context.base}/products`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inventory"
        title="Products & stock"
        lede="Every product, including retired ones. Stock changes apply at once and are safe alongside live orders — a correction adds or removes units rather than overwriting the count."
        actions={
          <Link href={`${root}/new`} className={cn(button.base, button.primary)}>
            New product
          </Link>
        }
      />

      <Form action={root} className="flex flex-wrap items-end gap-3">
        <input name="q" defaultValue={q} placeholder="Name, slug, number or collection" aria-label="Search products" className={cn(control, "w-72")} />
        <select name="status" defaultValue={status} aria-label="Availability" className={cn(control, "w-auto")}>
          <option value="">For sale and retired</option>
          <option value="active">For sale</option>
          <option value="inactive">Retired</option>
        </select>
        <select name="stock" defaultValue={stock} aria-label="Stock" className={cn(control, "w-auto")}>
          <option value="">Any stock</option>
          <option value="low">Running low</option>
          <option value="out">Sold out</option>
        </select>
        <button type="submit" className={cn(button.base, button.primary)}>
          Filter
        </button>
        {(q || status || stock) && (
          <Link href={root} className="tag-sm text-faint hover:text-fg">
            Clear
          </Link>
        )}
      </Form>

      {products.length === 0 ? (
        <Empty>No products match.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Adjust</Th>
              <Th>For sale</Th>
              <Th>Featured</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className={cn("hover:bg-surface", !product.active && "text-muted")}>
                <Td>
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" className="size-10 shrink-0 border border-line object-cover" />
                    ) : (
                      <span aria-hidden className="size-10 shrink-0 border border-dashed border-line" />
                    )}
                    <div className="min-w-0">
                      <Link href={`${root}/${product.slug}`} className="font-semibold hover:text-gold-deep">
                        {product.name}
                      </Link>
                      <span className="block text-[12px] text-faint">
                        {product.number} · {product.slug}
                        {!product.active && " · retired"}
                      </span>
                    </div>
                  </div>
                </Td>
                <Td className="tabular-nums">{money(product.baseCents)}</Td>
                <Td className="tabular-nums">
                  {product.digital ? (
                    <Flag>Digital</Flag>
                  ) : product.stock === 0 ? (
                    <Flag tone="warn">Sold out</Flag>
                  ) : (
                    <span className={cn(product.lowStock && "font-semibold text-gold-deep")}>{product.stock}</span>
                  )}
                </Td>
                <Td>{product.digital ? <span className="text-[12px] text-faint">—</span> : <StockControl slug={product.slug} stock={product.stock} compact />}</Td>
                <Td><FlagToggle slug={product.slug} flag="active" value={product.active} label={`${product.name} for sale`} /></Td>
                <Td><FlagToggle slug={product.slug} flag="featured" value={product.featured} label={`Feature ${product.name}`} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
