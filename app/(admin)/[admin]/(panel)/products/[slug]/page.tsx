import Link from "next/link";
import { ImageUpload } from "@/components/admin/image-upload";
import { ProductForm } from "@/components/admin/product-form";
import { StockControl } from "@/components/admin/stock-control";
import { Flag, PageHeader, Panel, dateTime } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";

export const generateMetadata = adminTitle("Edit product");

export default async function EditProductPage({ params, searchParams }: PageProps<"/[admin]/products/[slug]">) {
  const { admin, slug } = await params;
  const context = await requireAdmin(admin);
  const [product, options] = await Promise.all([
    adminData(context, (token) => api.product(token, slug)),
    adminData(context, api.productOptions),
  ]);
  const saved = (await searchParams).saved !== undefined;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={`Inventory · ${product.number}`}
        title={product.name}
        lede={
          <>
            Last changed {dateTime(product.updatedAt)}.{" "}
            {product.active ? (
              <Link href={`/store/${product.slug}`} className="underline underline-offset-4 hover:text-fg">
                View in the shop ↗
              </Link>
            ) : (
              "Retired — not for sale."
            )}
          </>
        }
        actions={
          <Link href={`/${context.base}/products`} className="tag-sm text-faint hover:text-fg">
            ← Inventory
          </Link>
        }
      />

      {saved && (
        <p role="status" className="border-l-2 border-gold-deep pl-4 text-[14px] text-gold-deep">
          Saved.
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ProductForm key={product.updatedAt ?? product.slug} product={product} options={options} />

        <div className="flex flex-col gap-8">
          <Panel title="Stock">
            {product.digital ? (
              <p className="text-[14px] text-muted">A digital download — there is nothing to count.</p>
            ) : (
              <>
                <p className="text-[36px] font-extrabold tabular-nums leading-none tracking-[-0.03em]">
                  {product.stock}
                </p>
                <p className="mb-5 mt-2 text-[12px] text-faint">
                  units on the shelf {product.lowStock && <Flag tone="warn">Running low</Flag>}
                </p>
                <StockControl slug={product.slug} stock={product.stock} />
              </>
            )}
          </Panel>

          <Panel title="Photograph">
            <ImageUpload slug={product.slug} image={product.image} name={product.name} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
