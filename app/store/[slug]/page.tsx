import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/shop/product-view";
import { getProduct, products, relatedProducts, reservedSlugs } from "@/lib/shop/catalog";

export function generateStaticParams() {
  // A product whose slug collides with `/store/cart` and friends would never
  // render — static segments win — so it is dropped here rather than in prod.
  return products
    .filter((product) => !reservedSlugs.has(product.slug))
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/store/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.line}. ${product.story}`,
  };
}

export default async function Page({ params }: PageProps<"/store/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || reservedSlugs.has(slug)) notFound();

  return <ProductView product={product} related={relatedProducts(product)} />;
}
