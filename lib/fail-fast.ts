import "server-only";

/**
 * Kill the process, and mean it.
 *
 * Split into its own module purely so `process.exit` is not in the source text
 * of `instrumentation.ts`. That file is compiled for the edge runtime as well
 * as node — `register()` runs in both — and the edge compiler warns about any
 * Node API it can see there, even one behind a `NEXT_RUNTIME` guard that never
 * lets it execute. Keeping it out of reach keeps the startup log clean, which
 * is the point of the check in the first place.
 */
export function failFast(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}
