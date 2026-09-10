/**
 * Finish the standalone build.
 *
 * `output: "standalone"` writes a self-contained server to `.next/standalone`
 * but leaves out `public/` and `.next/static/`, because Vercel-style hosting
 * serves those from a CDN. Nothing in this deployment does, so they have to be
 * copied in beside the server or the site comes up with no CSS, no fonts and no
 * images — which looks like a broken build rather than a missing copy step.
 *
 * It also strips the env files Next copies in. `next build` puts the project's
 * `.env` into `.next/standalone/`, development secrets and all — so the archive
 * you upload to a web host would otherwise carry your laptop's SESSION_SECRET
 * inside it. They are removed here and replaced with the template, so the
 * artifact holds instructions instead of credentials.
 */
import { cp, rm, access, readdir } from "node:fs/promises";
import { join } from "node:path";

const STANDALONE = ".next/standalone";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function replace(from, to) {
  if (!(await exists(from))) {
    console.warn(`  skipped ${from} (not present)`);
    return;
  }
  // Removed first: `cp` with `recursive` merges into an existing directory, so
  // a file deleted since the last build would otherwise live on in the output.
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`  ${from} -> ${to}`);
}

if (!(await exists(STANDALONE))) {
  console.error(
    `${STANDALONE} does not exist — run \`next build\` with \`output: "standalone"\` first.`,
  );
  process.exit(1);
}

console.log("Packaging standalone output:");
await replace("public", join(STANDALONE, "public"));
await replace(".next/static", join(STANDALONE, ".next/static"));

// Anything Next copied in is a development value by definition — the real ones
// are written on the server, after this artifact is uploaded.
for (const entry of await readdir(STANDALONE)) {
  if (entry.startsWith(".env")) {
    await rm(join(STANDALONE, entry), { recursive: true, force: true });
    console.log(`  removed leaked ${entry}`);
  }
}

await replace(".env.production.example", join(STANDALONE, ".env.production.example"));

console.log(
  `\nDone. Upload the contents of ${STANDALONE}/, add .env.production.local,\n` +
    "then start it with: node server.js",
);
