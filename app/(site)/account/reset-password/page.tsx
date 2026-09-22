import type { Metadata } from "next";
import { ResetPasswordView } from "@/components/account/reset-password-view";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/account/reset-password">) {
  // Both come from the link nisir-backend-php emailed (see its
  // `App\Notifications\ResetPasswordLink`). They are read here, on the server,
  // and handed to the form as hidden fields — the Server Action then gets them
  // from the post rather than trusting the browser's current URL.
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) ?? "";

  return <ResetPasswordView token={first(params.token)} email={first(params.email)} />;
}
