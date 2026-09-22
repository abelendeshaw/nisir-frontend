import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";

export const generateMetadata = adminTitle("New product");

export default async function NewProductPage({ params }: PageProps<"/[admin]/products/new">) {
  const context = await requireAdmin((await params).admin);
  const options = await adminData(context, api.productOptions);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Inventory"
        title="New product"
        lede="It goes on sale as soon as it is saved with “For sale” ticked. Add a photograph once it exists."
        actions={
          <Link href={`/${context.base}/products`} className="tag-sm text-faint hover:text-fg">
            ← Inventory
          </Link>
        }
      />
      <ProductForm options={options} />
    </div>
  );
}
