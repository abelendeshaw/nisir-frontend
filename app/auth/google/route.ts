import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_COOKIE, GOOGLE_COOKIE_PATH, GOOGLE_COOKIE_SECONDS, newNonce } from "@/lib/auth/google";
import { safeNext } from "@/lib/auth/next-path";
import { serverEnv } from "@/lib/env";

/**
 * "Continue with Google" starts here: a fresh nonce in a cookie on this
 * browser, and the browser on its way to the API, which forwards it to
 * Google. See `lib/auth/google.ts` for how the pieces fit.
 *
 * `?next=` rides in the cookie rather than through Google and back, so the
 * destination never leaves this site — and it is sanitised on both ends.
 */
export async function GET(request: NextRequest) {
  const env = serverEnv();
  const nonce = newNonce();
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  // Joined as strings, like `apiUrl()`, so a path prefix on the API survives.
  const target = new URL(`${env.NISIR_PUBLIC_API_URL}/auth/google/redirect`);
  target.searchParams.set("nonce", nonce);

  const response = NextResponse.redirect(target);
  response.cookies.set(GOOGLE_COOKIE, JSON.stringify({ nonce, next }), {
    httpOnly: true,
    secure: env.isProduction,
    // Lax, not strict: the browser comes back from Google through the API, a
    // cross-site top-level navigation, and a strict cookie would stay behind.
    sameSite: "lax",
    path: GOOGLE_COOKIE_PATH,
    maxAge: GOOGLE_COOKIE_SECONDS,
  });

  return response;
}
