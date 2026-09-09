"use client";

import { Fragment } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Empty } from "@/components/shop/bits";
import { Lines, Reveal } from "@/components/ui/reveal";
import { money } from "@/lib/shop/format";
import { useHydrated, useOrders } from "@/lib/shop/store";

/**
 * Name and email come from the signed session, read server-side and handed
 * down as a plain prop — this component never touches the cookie itself.
 * Orders still come from the browser's own local store (`lib/shop/store.ts`)
 * because nisir-backend does not keep them yet; see the note below the list.
 */
export function AccountView({ user }: { user: { name: string; email: string } }) {
  const orders = useOrders();
  const hydrated = useHydrated();

  return (
    <main id="main">
      <section className="slab-ink pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <div className="shell">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span className="text-faint">Account</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[16ch]"
            lines={[
              <Fragment key="a">
                {user.name.split(" ")[0]}<span className="thin text-gold">.</span>
              </Fragment>,
            ]}
          />

          <Reveal immediate delay={0.4}>
            <p className="lede mt-9">{user.email}</p>
          </Reveal>

          <Reveal immediate delay={0.5}>
            <form action={logout} className="mt-8">
              <button type="submit" className="tag-sm ul text-muted hover:text-accent">
                Sign out
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="shell">
          <div className="flex items-end justify-between gap-8 border-b-2 border-line pb-6">
            <p className="d4">Orders</p>
            <Link href="/store" className="tag-sm ul text-muted hover:text-accent">
              Browse the shop
            </Link>
          </div>

          {!hydrated ? null : orders.length === 0 ? (
            <div className="mt-8">
              <Empty
                eyebrow="Nothing yet"
                title={<>No orders on this device.</>}
                body="Once you place one, it shows up here."
              />
            </div>
          ) : (
            <ul className="mt-4 grid gap-px border-t border-line">
              {orders.map((order) => (
                <li key={order.id} className="border-b border-line py-5">
                  <Link
                    href={`/store/order/${order.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-4 hover:text-accent"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="text-[15px] text-fg">{order.id}</span>
                      <span className="text-[13px] text-faint">
                        {new Date(order.placedAt).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                    <span className="text-[14px] tabular-nums text-muted">
                      {money(order.totals.totalCents)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 max-w-xl text-[12px] leading-relaxed text-faint">
            Orders above are the ones placed on this device — the same record the receipt page
            keeps. They are not yet attached to your account on our servers, so a different device
            will not show them; that is next.
          </p>
        </div>
      </section>
    </main>
  );
}
