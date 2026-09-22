import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services, serviceName, getService, nextService } from "@/lib/services";
import { ServiceDetail } from "@/components/sections/service-detail";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: serviceName(service),
    description: service.detail,
  };
}

export default async function Page({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return <ServiceDetail service={service} next={nextService(slug)} />;
}
