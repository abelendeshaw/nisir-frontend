import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, decrypt } from "@/lib/auth/session";

/**
 * Optimistic auth redirects — reads the signed cookie, never the backend, so
 * this stays cheap on every request. Not the only line of defense: the
 * account page checks again itself, and cross-checks the session with
 * nisir-backend-php while it is there (see `lib/auth/dal.ts`), per Next's own
 * guidance that a redirect here is a UX shortcut, not the security boundary.
 */

const PROTECTED = ["/account"];
const AUTH_ONLY = ["/account/login", "/account/signup"];

/**
 * How a page that has just been told the backend disowns this cookie asks for
 * it to be cleared.
 *
 * A page cannot delete a cookie — `cookies().delete()` only works in a Server
 * Function or a Route Handler, because the header has to go out with the
 * response. So the account page redirects to `/account/login?expired=1` and
 * this is where the cookie actually dies.
 *
 * It is not decoration. Without it the two checks disagree and loop: the page
 * cross-checks, finds the token revoked and redirects to the login page,
 * which still holds a perfectly well-signed cookie, so the rule below bounces
 * it straight back to `/account`, forever. Nothing here is a way in — the
 * worst a visitor can do by typing it is sign themselves out.
 */
const EXPIRED = "expired";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !AUTH_ONLY.includes(pathname);
  const isAuthOnly = AUTH_ONLY.includes(pathname);

  if (!isProtected && !isAuthOnly) return NextResponse.next();

  if (isAuthOnly && searchParams.has(EXPIRED)) {
    const response = NextResponse.next();
    // On the response, not through `cookies()`: this is the one place in the
    // request that can still put a `Set-Cookie` header on the way out.
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const session = await decrypt(request.cookies.get(COOKIE_NAME)?.value);

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/account/login", request.url));
  }
  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL("/account", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
