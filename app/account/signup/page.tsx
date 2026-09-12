import type { Metadata } from "next";
import { SignupView } from "@/components/account/signup-view";
import { safeNext } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default async function SignupPage({ searchParams }: PageProps<"/account/signup">) {
  const params = await searchParams;

  /*
   * `?next=/store/checkout` means the checkout gate sent them — they were
   * buying something, not browsing for an account. The view says so, and
   * signing up returns them to the till.
   */
  return <SignupView next={safeNext(params.next)} />;
}
