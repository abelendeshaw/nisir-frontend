import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { exchangeGoogleCodeRemote } from "@/lib/auth/backend";
import { GOOGLE_COOKIE, GOOGLE_COOKIE_PATH, isGoogleError, readGoogleStart, type GoogleError } from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";

/**
 * Where the API sends the browser back after Google: with `?code=` when the
 * sign-in worked, `?error=` when it did not.
 *
 * The code alone is not enough. It is traded, server to server, together with
 * the nonce in this browser's cookie — set by `/auth/google` when this same
 * browser set off. A browser that did not start the sign-in has no matching
 * cookie, so a code planted in it (to sign a victim in as the attacker) or
 * copied out of a URL signs nobody in.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const store = await cookies();

  // Read once and spent: a sign-in gets one attempt at this.
  const started = readGoogleStart(store.get(GOOGLE_COOKIE)?.value);
  store.delete({ name: GOOGLE_COOKIE, path: GOOGLE_COOKIE_PATH });

  const back = (reason: GoogleError): never => redirect(`/account/login?google=${reason}`);

  // No cookie: it expired while they were on Google's screens, or this is a
  // different browser from the one that started.
  if (!started) return back("expired");

  const error = params.get("error");
  if (error !== null) return back(isGoogleError(error) ? error : "failed");

  const code = params.get("code");
  if (!code) return back("failed");

  try {
    const user = await exchangeGoogleCodeRemote({ code, nonce: started.nonce });
    await createSession({ userId: user.id, email: user.email, name: user.name, token: user.token });
  } catch {
    return back("failed");
  }

  redirect(started.next ?? "/account");
}
