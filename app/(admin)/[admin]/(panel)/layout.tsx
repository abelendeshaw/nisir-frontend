import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/dal";

/**
 * Every screen behind the admin login. The guard runs here and again in each
 * page — a layout is not re-rendered on every navigation, so it cannot be the
 * only check. Both share one backend call per request (`requireAdmin` is
 * cached).
 */
export default async function PanelLayout({ children, params }: LayoutProps<"/[admin]">) {
  const { base, session } = await requireAdmin((await params).admin);

  return (
    <AdminShell base={base} admin={{ name: session.name, email: session.email }}>
      {children}
    </AdminShell>
  );
}
