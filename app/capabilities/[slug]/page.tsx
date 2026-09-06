import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { capabilities, capabilityName, getCapability, nextCapability } from "@/lib/capabilities";
import { CapabilityPage } from "@/components/capability-page";

export function generateStaticParams() {
  return capabilities.map((capability) => ({ slug: capability.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/capabilities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const capability = getCapability(slug);
  if (!capability) return {};
  return { title: capabilityName(capability) };
}

export default async function Page({ params }: PageProps<"/capabilities/[slug]">) {
  const { slug } = await params;
  const capability = getCapability(slug);
  if (!capability) notFound();

  return <CapabilityPage capability={capability} next={nextCapability(slug)} />;
}
