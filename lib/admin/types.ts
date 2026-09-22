/**
 * What the admin API answers with. Mirrors the resources in
 * nisir-backend-php's `app/Http/Resources/Admin` and `SalesReportService`.
 *
 * Deliberately free of `server-only`: the admin screens' client components
 * render these shapes, and a type import carries no code across.
 */

import type { Category, FinishId, MaterialId, Product, RelicKind, SizeId } from "@/lib/shop/catalog";
import type { CartLine } from "@/lib/shop/pricing";
import type { PlacedOrder } from "@/lib/shop/orders-server";

export type AdminUser = { id: string; email: string; name: string };

export type OrderStatus = "pending_payment" | "paid" | "payment_failed" | "cancelled" | "fulfilled";

/**
 * In the order an order usually moves through them. The two that end an
 * order without shipping it come last, and the admin panel warns before
 * either: they put the order's units back on the shelf.
 */
export const ORDER_STATUSES: { id: OrderStatus; label: string; releasesStock: boolean }[] = [
  { id: "pending_payment", label: "Awaiting payment", releasesStock: false },
  { id: "paid", label: "Paid", releasesStock: false },
  { id: "fulfilled", label: "Fulfilled", releasesStock: false },
  { id: "payment_failed", label: "Payment failed", releasesStock: true },
  { id: "cancelled", label: "Cancelled", releasesStock: true },
];

export function statusLabel(status: string): string {
  return ORDER_STATUSES.find((entry) => entry.id === status)?.label ?? status;
}

/** Laravel's paginator, as the admin list endpoints return it. */
export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
};

export type AdminOrderRow = {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  placedAt: string;
  customer: { name: string; email: string; guest: boolean };
  totalCents: number;
  itemCount: number;
  paymentMethod: string;
  needsReview: boolean;
};

export type AdminOrderLine = Omit<CartLine, "custom"> & {
  /**
   * The storefront's spec plus the server's verdict on the mesh, which the
   * print floor needs and the customer's receipt does not show.
   */
  custom?: NonNullable<CartLine["custom"]> & { watertight?: boolean; inverted?: boolean };
  customFileId: string | null;
  materialId: string | null;
  finishId: string | null;
  sizeId: string | null;
};

export type AdminOrder = Omit<PlacedOrder, "lines" | "status"> & {
  status: OrderStatus;
  statusLabel: string;
  lines: AdminOrderLine[];
  userId: string | null;
  updatedAt: string | null;
  confirmationEmailedAt: string | null;
};

/**
 * The storefront's product, with the flags it omits when false written out,
 * and the fields only the catalogue's keepers see.
 */
export type AdminProduct = Omit<Product, "volumeCm3" | "digital" | "featured"> & {
  imagePath: string | null;
  volumeCm3: number | null;
  digital: boolean;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  lowStock: boolean;
  updatedAt: string | null;
};

export type ProductOptions = {
  materials: { id: MaterialId; name: string; active: boolean }[];
  finishes: { id: FinishId; name: string; active: boolean }[];
  sizes: { id: SizeId; name: string; active: boolean }[];
  categories: Category[];
  relics: RelicKind[];
  collections: string[];
  reservedSlugs: string[];
  lowStockThreshold: number;
};

export type BestSeller = {
  rank: number;
  slug: string;
  name: string;
  units: number;
  revenueCents: number;
  orders: number;
  product: AdminProduct | null;
};

export type Dashboard = {
  windowDays: number;
  revenueCents: number;
  previousRevenueCents: number;
  orders: number;
  previousOrders: number;
  awaitingPayment: number;
  needsReview: number;
  customers: number;
  revenueByDay: { date: string; revenueCents: number; orders: number }[];
  lowStock: AdminProduct[];
  recentOrders: AdminOrderRow[];
  topSellers: BestSeller[];
};

export type PromoKind = "percent" | "amount" | "shipping";

export type AdminPromo = {
  code: string;
  label: string;
  kind: PromoKind;
  value: number;
  minimumCents: number | null;
  active: boolean;
  expiresAt: string | null;
  live: boolean;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  joinedAt: string | null;
  orders: number;
  spentCents: number;
};

/** What every admin Server Action hands back to the form that called it. */
export type AdminFormState =
  | {
      ok?: boolean;
      message?: string;
      /** Laravel's validation errors, keyed by the API's field names. */
      errors?: Record<string, string[]>;
    }
  | undefined;
