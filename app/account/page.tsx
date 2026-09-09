import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountView } from "@/components/account/account-view";
import { getUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage() {
  // `proxy.ts` already redirects signed-out visitors before this runs — this
  // check is the real boundary, not a formality. See lib/auth/dal.ts.
  const user = await getUser();
  if (!user) redirect("/account/login");

  return <AccountView user={{ name: user.name, email: user.email }} />;
}
