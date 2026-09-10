/**
 * Runs once when a server instance starts, before it takes any request.
 *
 * The only job here is to prove the environment is usable. A missing
 * `SESSION_SECRET` used to be discovered by the first visitor who tried to
 * sign in; a wrong `NISIR_API_URL` by the first one who opened the store.
 * Checking at boot turns both into a failure you see in the startup log, next
 * to the deploy that caused it.
 */
export async function register() {
  // `register` is invoked for the edge runtime as well, where a duplicate
  // check would add nothing — the node server is the one that has to be right.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { assertServerEnv } = await import("@/lib/env");

  // During `next build` the thrown error is the right outcome: it fails the
  // build with a stack, which is what a build tool is supposed to do.
  if (process.env.NEXT_PHASE?.includes("build")) {
    assertServerEnv();
    return;
  }

  try {
    assertServerEnv();
  } catch (error) {
    // Letting this throw is not enough. Next catches it, logs "Failed to
    // prepare server", and then keeps the process alive answering 500 to
    // everything — so the port stays open, a TCP health check passes, and
    // Passenger or pm2 sees a happy process. A misconfigured server should be
    // dead and restarting loudly, not quietly serving errors.
    const { failFast } = await import("@/lib/fail-fast");
    failFast(error instanceof Error ? error.message : String(error));
  }
}
