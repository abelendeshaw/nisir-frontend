import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/shop/product-view";
import { getProduct, relatedProducts, reservedSlugs } from "@/lib/shop/catalog";
import { loadCatalog } from "@/lib/shop/catalog-server";

export async function generateStaticParams() {
  let products;
  try {
    ({ products } = await loadCatalog());
  } catch (cause) {
    // Prerender nothing rather than fail the build: every page still renders
    // on first request. Worth a line in the build log, not a dead deploy.
    console.warn("[store] catalogue unreachable at build — product pages will render on demand.", cause);
    return [];
  }

  // A product whose slug collides with `/store/cart` and friends would never
  // render — static segments win — so it is dropped here rather than in prod.
  return products
    .filter((product) => !reservedSlugs.has(product.slug))
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/store/[slug]">): Promise<Metadata> {
  const [{ slug }] = await Promise.all([params, loadCatalog()]);
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.line}. ${product.story}`,
  };
}

export default async function Page({ params }: PageProps<"/store/[slug]">) {
  const [{ slug }] = await Promise.all([params, loadCatalog()]);
  const product = getProduct(slug);
  if (!product || reservedSlugs.has(slug)) notFound();

  return <ProductView product={product} related={relatedProducts(product)} />;
}
