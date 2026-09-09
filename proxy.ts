import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

/**
 * Optimistic auth redirects — reads the signed cookie, never the backend, so
 * this stays cheap on every request. Not the only line of defense: the
 * account page checks again itself (see `app/account/page.tsx`), per Next's
 * own guidance that a redirect here is a UX shortcut, not the security
 * boundary.
 */

const PROTECTED = ["/account"];
const AUTH_ONLY = ["/account/login", "/account/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !AUTH_ONLY.includes(pathname);
  const isAuthOnly = AUTH_ONLY.includes(pathname);

  if (!isProtected && !isAuthOnly) return NextResponse.next();

  const session = await decrypt(request.cookies.get("nisir_session")?.value);

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
