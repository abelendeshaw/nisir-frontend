import {
  collections,
  finishById,
  finishes,
  materialById,
  materials,
  products,
  sizeById,
  sizes,
  type Finish,
  type Material,
  type Product,
  type Size,
} from "./catalog";
import {
  promos,
  rushById,
  rushTiers,
  shippingMethods,
  zoneById,
  zones,
  type Promo,
  type RushTier,
  type ShippingMethod,
  type Zone,
} from "./pricing";

/**
 * The one place the catalogue is filled.
 *
 * `catalog.ts` and `pricing.ts` export empty containers; this refills them in
 * place so every existing import keeps its reference and every pricing
 * function stays synchronous. See the note at the top of `catalog.ts` for why
 * that mattered enough to mutate module state rather than thread a promise
 * through ten components.
 *
 * Called twice per page: once on the server (`catalog-server.ts`, per request)
 * and once on the client (`CatalogHydrator`, at hydration), always before
 * anything that reads a price has rendered.
 */

export type CatalogPayload = {
  products: Product[];
  materials: Material[];
  finishes: Finish[];
  sizes: Size[];
  rushTiers: RushTier[];
  zones: Zone[];
  shippingMethods: ShippingMethod[];
  promos: Promo[];
  collections: string[];
};

export function setCatalog(data: CatalogPayload): void {
  refill(products, data.products);
  refill(materials, data.materials);
  refill(finishes, data.finishes);
  refill(sizes, data.sizes);
  refill(rushTiers, data.rushTiers);
  refill(zones, data.zones);
  refill(shippingMethods, data.shippingMethods);
  refill(promos, data.promos);
  refill(collections, data.collections);

  remap(materialById, data.materials);
  remap(finishById, data.finishes);
  remap(sizeById, data.sizes);
  remap(zoneById, data.zones);
  remap(rushById, data.rushTiers);
}

/** Same array object, new contents — importers keep their reference. */
function refill<T>(target: T[], next: readonly T[]): void {
  target.length = 0;
  target.push(...next);
}

function remap<K extends string, V extends { id: K }>(
  target: Map<K, V>,
  rows: readonly V[],
): void {
  target.clear();
  for (const row of rows) target.set(row.id, row);
}
