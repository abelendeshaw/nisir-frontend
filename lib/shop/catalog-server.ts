import "server-only";

import { cache } from "react";

import { apiUrl, serverEnv } from "@/lib/env";
import { setCatalog, type CatalogPayload } from "./catalog-store";

/**
 * Reads the catalogue from nisir-backend, and fills the module tables the
 * pricing functions read synchronously.
 *
 * `cache()` dedupes this to one call per request, and `revalidate` keeps it to
 * one call per minute across requests — a stock figure or a price edit shows
 * up within the minute without every page paying for a round trip.
 *
 * Any server page that renders a price should await this first. The root
 * layout awaits it too, both to fill the server-side tables for that request
 * and to hand the same payload to the client.
 */
export const loadCatalog = cache(async (): Promise<CatalogPayload> => {
  let response: Response;
  try {
    response = await fetch(apiUrl("/catalog"), {
      next: { revalidate: 60 },
    });
  } catch (cause) {
    // Loud rather than an empty storefront: a catalogue that silently renders
    // zero objects is far harder to diagnose than a failed fetch.
    throw new Error(
      `Could not reach nisir-backend at ${serverEnv().NISIR_API_URL}.`,
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(`nisir-backend answered ${response.status} for /catalog.`);
  }

  const data = (await response.json()) as CatalogPayload;
  setCatalog(data);
  return data;
});
