import { notFound, redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { adminSession } from "@/lib/admin/api";
import { adminTitle, isAdminPath } from "@/lib/admin/dal";
import { readAdminSession } from "@/lib/admin/session";

export const generateMetadata = adminTitle("Sign in");

export default async function AdminLoginPage({ params, searchParams }: PageProps<"/[admin]/login">) {
  const { admin } = await params;
  if (!isAdminPath(admin)) notFound();

  const expired = (await searchParams).expired !== undefined;

  /*
   * Already signed in — and the backend agrees — so there is nothing to do
   * here. Asking the backend rather than trusting the cookie is what keeps
   * this from bouncing with the panel: a dead token sends the panel here, and
   * a still-valid-looking cookie would otherwise send it straight back.
   */
  const session = await readAdminSession();
  if (session && !expired) {
    const live = await adminSession(session.token).then(
      () => true,
      () => false,
    );
    if (live) redirect(`/${admin}`);
  }

  return <AdminLoginForm expired={expired} />;
}
