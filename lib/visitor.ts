import "server-only";

import { headers } from "next/headers";

/**
 * The visitor's IP address, passed on to nisir-backend-php.
 *
 * Every backend call is made by this server, so without this the backend sees
 * one address for every customer at once. Its login and upload rate limits
 * then either do nothing (one bucket shared by an attacker and every honest
 * shopper) or, if tightened, let one attacker lock everybody out. Forwarding
 * the visitor's address — which the backend believes only because this
 * server's IP is in its `TRUSTED_PROXIES` — gives each visitor their own.
 *
 * The rightmost `X-Forwarded-For` entry is the one taken: it was added by the
 * proxy nearest this server (or, with none, filled in by Next from the socket),
 * where anything to its left was sent by the browser and could say anything.
 */

const LOOKS_LIKE_AN_IP = /^[0-9A-Fa-f:.]{2,45}$/;

export async function visitorHeaders(): Promise<Record<string, string>> {
  const incoming = await headers();

  const nearest =
    incoming
      .get("x-forwarded-for")
      ?.split(",")
      .map((hop) => hop.trim())
      .filter(Boolean)
      .at(-1) ?? incoming.get("x-real-ip")?.trim();

  return nearest && LOOKS_LIKE_AN_IP.test(nearest) ? { "X-Forwarded-For": nearest } : {};
}
