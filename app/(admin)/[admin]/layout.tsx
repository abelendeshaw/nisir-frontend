import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminPath } from "@/lib/admin/dal";

/**
 * The admin panel, at `/<ADMIN_PATH>`.
 *
 * A dynamic segment at the root of the site, so it is reached by every
 * single-segment address the storefront does not claim — and for every one of
 * them except the configured path, this answers with the site's ordinary 404.
 * With `ADMIN_PATH` unset, it answers that way for all of them: the panel is
 * switched off. See `lib/env.ts` and `lib/admin/dal.ts`.
 *
 * Outside `app/(site)`, so none of the storefront's chrome — no intro, no
 * cart, no custom cursor — comes with it.
 */
export async function generateMetadata({ params }: LayoutProps<"/[admin]">): Promise<Metadata> {
  if (!isAdminPath((await params).admin)) return {};

  return {
    title: { default: "Admin", template: "%s — Nisir admin" },
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function AdminLayout({ children, params }: LayoutProps<"/[admin]">) {
  if (!isAdminPath((await params).admin)) notFound();

  return children;
}
