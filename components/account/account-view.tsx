"use client";

import { Fragment } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Empty } from "@/components/shop/bits";
import { Lines, Reveal } from "@/components/ui/reveal";
import { money } from "@/lib/shop/format";
import type { OrderSummary } from "@/lib/shop/orders-server";

/**
 * Name and email come from the signed session, read server-side and handed
 * down as a plain prop — this component never touches the cookie itself.
 * Orders are fetched server-side too, from nisir-backend, so they are the
 * account's orders rather than this browser's.
 */
export function AccountView({
  user,
  orders,
}: {
  user: { name: string; email: string };
  orders: OrderSummary[];
}) {

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

          {orders.length === 0 ? (
            <div className="mt-8">
              <Empty
                eyebrow="Nothing yet"
                title={<>No orders yet.</>}
                body="Once you place one, it shows up here — on any device you sign in from."
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
            Every order placed while signed in, on any device. Orders placed as a guest are
            reachable by their number instead.
          </p>
        </div>
      </section>
    </main>
  );
}
