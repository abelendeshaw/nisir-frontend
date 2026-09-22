import "server-only";

import { cache } from "react";

import { apiUrl, serverEnv } from "@/lib/env";
import { setCatalog, type CatalogPayload } from "./catalog-store";

/** The cache tag on the catalogue fetch. */
export const CATALOG_TAG = "catalog";

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
      headers: { Accept: "application/json" },
      // Tagged so an edit made in the admin panel expires it at once (see
      // `updateTag(CATALOG_TAG)` in `app/actions/admin.ts`) rather than
      // leaving the old price on the shelf for up to a minute.
      next: { revalidate: 60, tags: [CATALOG_TAG] },
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
