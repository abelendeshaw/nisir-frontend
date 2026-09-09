"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cartCount, subtotal, type CartLine } from "./pricing";

/**
 * Cart and wishlist — kept in module-level stores read through
 * `useSyncExternalStore`, the same way `lib/hooks.ts` reads matchMedia.
 *
 * No provider, which matters: the header lives in the root layout and the
 * product page lives four segments down, and both need the same cart without
 * one of them having to own the other.
 *
 * Hydration is deliberate. The server has no localStorage, so the first client
 * render must agree with it — an empty cart. Reading storage is deferred to
 * the first `subscribe`, which React only calls in an effect, after hydration
 * has already matched. The cart then appears one frame later, correctly,
 * rather than never or noisily.
 */

type Listener = () => void;

function createStore<T>(key: string, empty: T, revive: (raw: unknown) => T | null) {
  let state = empty;
  let loaded = false;
  const listeners = new Set<Listener>();

  const emit = () => listeners.forEach((listener) => listener());

  function read() {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return revive(JSON.parse(raw));
    } catch {
      // Private mode, a quota wall, or a payload from an older shape. An empty
      // cart is a survivable outcome; a thrown render is not.
      return null;
    }
  }

  function load() {
    if (loaded) return;
    loaded = true;
    const next = read();
    if (next) {
      state = next;
      emit();
    }
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    load();
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  }

  // A second tab is the same shopper. Keep them in step.
  function onStorage(event: StorageEvent) {
    if (event.key !== key) return;
    const next = read();
    state = next ?? empty;
    emit();
  }

  function set(next: T) {
    state = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Storage is a convenience here, never the source of truth for a render. */
    }
    emit();
  }

  return {
    subscribe,
    snapshot: () => state,
    server: () => empty,
    get: () => state,
    set,
    update: (fn: (current: T) => T) => set(fn(state)),
  };
}

/* ------------------------------------------------------------------ cart -- */

const NO_LINES: CartLine[] = [];

const cartStore = createStore<CartLine[]>("nisir.cart.v1", NO_LINES, (raw) => {
  if (!Array.isArray(raw)) return null;
  const lines = raw.filter(
    (line): line is CartLine =>
      !!line &&
      typeof line.id === "string" &&
      typeof line.unitCents === "number" &&
      Number.isFinite(line.unitCents) &&
      typeof line.qty === "number" &&
      line.qty > 0,
  );
  return lines.length ? lines : null;
});

export function useCartLines() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.snapshot, cartStore.server);
}

export function useCart() {
  const lines = useCartLines();

  const add = useCallback((line: CartLine) => {
    cartStore.update((current) => {
      const found = current.find((entry) => entry.id === line.id);
      if (!found) return [...current, line];
      // Same configuration, so the quantities merge rather than stacking two
      // identical rows the shopper then has to reconcile.
      return current.map((entry) =>
        entry.id === line.id ? { ...entry, qty: Math.min(99, entry.qty + line.qty) } : entry,
      );
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    cartStore.update((current) =>
      qty <= 0
        ? current.filter((entry) => entry.id !== id)
        : current.map((entry) =>
            entry.id === id ? { ...entry, qty: Math.min(99, Math.round(qty)) } : entry,
          ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    cartStore.update((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => cartStore.set(NO_LINES), []);

  return {
    lines,
    count: cartCount(lines),
    subtotalCents: subtotal(lines),
    add,
    setQty,
    remove,
    clear,
  };
}

/* -------------------------------------------------------------- wishlist -- */

const NO_SLUGS: string[] = [];

const wishlistStore = createStore<string[]>("nisir.wishlist.v1", NO_SLUGS, (raw) => {
  if (!Array.isArray(raw)) return null;
  const slugs = raw.filter((slug): slug is string => typeof slug === "string");
  return slugs.length ? slugs : null;
});

export function useWishlist() {
  const slugs = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.snapshot,
    wishlistStore.server,
  );

  const toggle = useCallback((slug: string) => {
    wishlistStore.update((current) =>
      current.includes(slug) ? current.filter((entry) => entry !== slug) : [slug, ...current],
    );
  }, []);

  const remove = useCallback((slug: string) => {
    wishlistStore.update((current) => current.filter((entry) => entry !== slug));
  }, []);

  const clear = useCallback(() => wishlistStore.set(NO_SLUGS), []);

  return {
    slugs,
    count: slugs.length,
    has: (slug: string) => slugs.includes(slug),
    toggle,
    remove,
    clear,
  };
}

/* ----------------------------------------------------------------- promo -- */

const promoStore = createStore<string>("nisir.promo.v1", "", (raw) =>
  typeof raw === "string" && raw.length > 0 ? raw : null,
);

/**
 * A code entered in the cart has to still be applied at checkout — otherwise
 * the total quietly grows between the two screens, which is the single fastest
 * way to lose an order.
 */
export function usePromoCode() {
  const code = useSyncExternalStore(promoStore.subscribe, promoStore.snapshot, promoStore.server);
  const setCode = useCallback((next: string) => promoStore.set(next.trim().toUpperCase()), []);
  return [code, setCode] as const;
}

/* ---------------------------------------------------------------- orders -- */

/**
 * Orders used to live here, in localStorage, next to the cart. They now live
 * in Postgres behind nisir-backend: checkout posts the cart's intent, the
 * server prices it and returns the order, and the receipt and account pages
 * read it back (`lib/shop/orders-server.ts`). A receipt therefore survives a
 * cleared cache and follows the account to another device, which the old
 * store could not do.
 *
 * The cart and wishlist stay here on purpose — both belong to the browser
 * until someone decides to buy, and neither needs an account to work.
 */

export type PaymentMethodId = "card" | "telebirr" | "cbe" | "transfer";

/**
 * Whether the client has taken over from the server snapshot.
 *
 * The stores above are empty for exactly one render, and a page that has to
 * say "no such order" needs to tell that render apart from a genuinely missing
 * order — otherwise every receipt flashes a 404 before it appears.
 */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* ------------------------------------------------------------- cart flap -- */

/**
 * Whether the cart drawer is open. A store rather than state because the
 * button that opens it (header) and the buttons that should open it (every
 * product page) are on opposite sides of the tree.
 */
let drawerOpen = false;
const drawerListeners = new Set<Listener>();

export function openCart() {
  if (drawerOpen) return;
  drawerOpen = true;
  drawerListeners.forEach((listener) => listener());
}

export function closeCart() {
  if (!drawerOpen) return;
  drawerOpen = false;
  drawerListeners.forEach((listener) => listener());
}

export function useCartOpen() {
  return useSyncExternalStore(
    (listener) => {
      drawerListeners.add(listener);
      return () => drawerListeners.delete(listener);
    },
    () => drawerOpen,
    () => false,
  );
}
