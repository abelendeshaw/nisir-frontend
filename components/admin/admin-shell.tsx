"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/app/actions/admin";
import { Mark } from "@/components/chrome/mark";
import { cn } from "@/lib/utils";

const NAV = [
  { path: "", label: "Dashboard" },
  { path: "/orders", label: "Orders" },
  { path: "/products", label: "Inventory" },
  { path: "/best-sellers", label: "Best sellers" },
  { path: "/promos", label: "Promos" },
  { path: "/customers", label: "Customers" },
];

/**
 * The panel's frame: a rail of sections on the left (a strip across the top
 * on a phone), and the page beside it.
 *
 * `base` is handed down from the server, which has already checked it — this
 * component only builds links with it.
 */
export function AdminShell({
  base,
  admin,
  children,
}: {
  base: string;
  admin: { name: string; email: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const root = `/${base}`;

  const isActive = (path: string) =>
    path === "" ? pathname === root : pathname === `${root}${path}` || pathname.startsWith(`${root}${path}/`);

  return (
    <div className="slab-bone min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="slab-ink lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block">
          <Link href={root} className="flex items-center gap-3">
            <Mark className="w-8 text-gold" />
            <span>
              <span className="tag block">Nisir</span>
              <span className="tag-sm mt-1 block text-faint">Admin</span>
            </span>
          </Link>
          <Link href="/" className="tag-sm text-faint hover:text-gold lg:mt-6 lg:inline-block">
            View the shop ↗
          </Link>
        </div>

        <nav aria-label="Admin" className="overflow-x-auto border-y border-line lg:flex-1 lg:border-b-0">
          <ul className="flex lg:flex-col">
            {NAV.map((item) => (
              <li key={item.path}>
                <Link
                  href={`${root}${item.path}`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className={cn(
                    "tag block whitespace-nowrap border-b-2 border-transparent px-5 py-4 transition-colors lg:border-b-0 lg:border-l-2",
                    isActive(item.path) ? "border-gold text-gold" : "text-muted hover:text-bone",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden border-t border-line px-5 py-5 lg:block">
          <p className="truncate text-[13px] text-bone">{admin.name}</p>
          <p className="truncate text-[12px] text-faint">{admin.email}</p>
          <form action={adminLogout} className="mt-4">
            <button type="submit" className="tag-sm text-faint underline-offset-4 hover:text-gold hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4 border-b-2 border-line px-5 py-3 lg:hidden">
          <p className="truncate text-[13px] text-muted">{admin.email}</p>
          <form action={adminLogout}>
            <button type="submit" className="tag-sm text-muted hover:text-fg">
              Sign out
            </button>
          </form>
        </div>
        <main id="main" className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
