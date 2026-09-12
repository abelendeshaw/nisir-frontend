import type { Metadata } from "next";
import { LoginView } from "@/components/account/login-view";
import { safeNext } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  // Set by the account page when nisir-backend-php disowned the session token
  // (see lib/auth/dal.ts); `proxy.ts` has already cleared the cookie by the
  // time this renders. Without a word here, a customer whose session was
  // revoked elsewhere just finds themselves back at a login form for no
  // visible reason.
  const params = await searchParams;

  return (
    <LoginView
      expired={"expired" in params}
      reset={"reset" in params}
      // Set by the checkout gate and by `proxy.ts`. Sanitised here rather
      // than in the view, so the client component is handed a path that is
      // already known to be safe to submit back.
      next={safeNext(params.next)}
    />
  );
}
