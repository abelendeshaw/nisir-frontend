import "server-only";

/**
 * The server's environment, read and checked in one place.
 *
 * Four files used to reach for `process.env.NISIR_API_URL` themselves and
 * throw their own error when it was missing — each one advising you to copy
 * `.env.example` to `.env.local`, which is right on a laptop and useless on a
 * web server. They also only threw when someone happened to walk the code
 * path: a server with no `SESSION_SECRET` would boot happily, serve the home
 * page, and fail at the moment a visitor first tried to sign in.
 *
 * This module inverts that. `serverEnv()` validates everything once and
 * memoises it, and `assertServerEnv()` is called from `instrumentation.ts`, so
 * a misconfigured deployment fails while you are still watching the startup
 * log rather than hours later in front of a customer.
 *
 * Edge-safe on purpose: `proxy.ts` imports `lib/auth/session.ts`, which imports
 * this, and that runs on the edge runtime. No `node:` builtins, no `Buffer`.
 */

export type ServerEnv = {
  /** Signs the session cookie. See `lib/auth/session.ts`. */
  SESSION_SECRET: string;
  /** Base URL of nisir-backend, normalised, no trailing slash. */
  NISIR_API_URL: string;
  NODE_ENV: "development" | "production" | "test";
  isProduction: boolean;
};

/**
 * A secret that is present but still the one from the template is the failure
 * that looks like success — it boots, it signs cookies, and every deployment
 * that copied the same file can mint a valid session for the others.
 */
const PLACEHOLDER_SECRETS = new Set([
  "changeme",
  "change-me",
  "your-secret-here",
  "replace-me",
  "secret",
  "todo",
]);

/** http to one of these never leaves the machine, so it needs no TLS. */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** HS256 wants at least as many key bytes as the digest it produces. */
const MIN_SECRET_LENGTH = 32;

function readNodeEnv(): ServerEnv["NODE_ENV"] {
  const raw = process.env.NODE_ENV;
  return raw === "production" || raw === "test" ? raw : "development";
}

function readSessionSecret(problems: string[]): string {
  const raw = process.env.SESSION_SECRET?.trim();

  if (!raw) {
    problems.push(
      "SESSION_SECRET is not set. It signs the session cookie, so without it " +
        "nobody can sign in.\n    Generate one with:  openssl rand -base64 32",
    );
    return "";
  }
  if (PLACEHOLDER_SECRETS.has(raw.toLowerCase())) {
    problems.push(
      "SESSION_SECRET is still a placeholder value. Anyone holding the same " +
        "template can forge a session cookie for this site.\n" +
        "    Generate a real one with:  openssl rand -base64 32",
    );
    return "";
  }
  if (raw.length < MIN_SECRET_LENGTH) {
    problems.push(
      `SESSION_SECRET is ${raw.length} characters; HS256 wants at least ` +
        `${MIN_SECRET_LENGTH}. A short key is a guessable key.\n` +
        "    Generate one with:  openssl rand -base64 32",
    );
    return "";
  }
  return raw;
}

function readApiUrl(problems: string[], isProduction: boolean): string {
  const raw = process.env.NISIR_API_URL?.trim();

  if (!raw) {
    problems.push(
      "NISIR_API_URL is not set. It is the base URL of nisir-backend, which " +
        "serves the catalogue, auth and orders — the storefront cannot render " +
        "a price without it.\n    Example:  https://api.nisirdesigns.com",
    );
    return "";
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    problems.push(
      `NISIR_API_URL is not a valid absolute URL: ${JSON.stringify(raw)}.\n` +
        "    It needs the scheme too, e.g. https://api.nisirdesigns.com — not " +
        "api.nisirdesigns.com.",
    );
    return "";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    problems.push(
      `NISIR_API_URL has to be http or https, not ${url.protocol.replace(":", "")}.`,
    );
    return "";
  }

  // The session cookie carries the backend's access token, and Server Actions
  // replay it on these requests as an `Authorization: Bearer` header. Over
  // plaintext http to another machine that token is readable by anything on
  // the path, so in production it is a hard error rather than a warning.
  if (isProduction && url.protocol === "http:" && !LOOPBACK_HOSTS.has(url.hostname)) {
    problems.push(
      `NISIR_API_URL points at ${url.host} over plaintext http in production. ` +
        "Every signed-in request replays the backend access token on this " +
        "connection as a Bearer header, so http would put it on the wire in " +
        "clear.\n    Use https://, or point at loopback (http://127.0.0.1:3000) " +
        "if the backend runs on this same machine.",
    );
    return "";
  }

  // Normalised once here so callers never have to think about whether the
  // value they were given ended in a slash.
  return url.toString().replace(/\/+$/, "");
}

export class EnvironmentError extends Error {
  constructor(problems: string[], nodeEnv: ServerEnv["NODE_ENV"]) {
    const where =
      nodeEnv === "production"
        ? "Set these on the server — in `.env.production.local` next to the app, " +
          "or as real environment variables in your host's control panel.\n" +
          "`.env.production.example` in the repo is the template to copy."
        : "Copy `.env.example` to `.env.local` and fill it in. `.env.local` is " +
          "gitignored, so real values stay off the repo.";

    super(
      `Environment is not configured (NODE_ENV=${nodeEnv}).\n\n` +
        problems.map((problem) => `  - ${problem}`).join("\n\n") +
        `\n\n${where}\n`,
    );
    this.name = "EnvironmentError";
  }
}

let cached: ServerEnv | null = null;

/**
 * The validated environment. Throws `EnvironmentError` listing *every* problem
 * at once — fixing one variable only to be told about the next one is a slow
 * way to configure a server.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const NODE_ENV = readNodeEnv();
  const isProduction = NODE_ENV === "production";
  const problems: string[] = [];

  const SESSION_SECRET = readSessionSecret(problems);
  const NISIR_API_URL = readApiUrl(problems, isProduction);

  if (problems.length > 0) throw new EnvironmentError(problems, NODE_ENV);

  cached = { SESSION_SECRET, NISIR_API_URL, NODE_ENV, isProduction };
  return cached;
}

/** Called from `instrumentation.ts` so a bad config never reaches a request. */
export function assertServerEnv(): void {
  serverEnv();
}

/**
 * Build an absolute nisir-backend URL.
 *
 * Not `new URL(path, base)`, which is what every call site used to do: an
 * absolute path *replaces* the base's path, so a backend mounted under a
 * prefix — `https://api.nisirdesigns.com/v1` — quietly lost the `/v1` and every
 * request 404'd. Joining the strings keeps the prefix, which is the normal
 * shape once the backend shares a domain with something else.
 */
export function apiUrl(path: string): string {
  const base = serverEnv().NISIR_API_URL;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
