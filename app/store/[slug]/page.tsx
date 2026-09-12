import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/shop/product-view";
import { getProduct, relatedProducts, reservedSlugs } from "@/lib/shop/catalog";
import { loadCatalog } from "@/lib/shop/catalog-server";

/**
 * Product pages must render at request time.
 *
 * The catalogue comes from the live Laravel API, so we don't want GoDaddy
 * trying to prerender these pages during the build.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/store/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  await loadCatalog();

  const product = getProduct(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: `${product.line}. ${product.story}`,
  };
}

export default async function Page({ params }: PageProps<"/store/[slug]">) {
  const { slug } = await params;

  await loadCatalog();

  const product = getProduct(slug);

  if (!product || reservedSlugs.has(slug)) {
    notFound();
  }

  return <ProductView product={product} related={relatedProducts(product)} />;
}
