"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LineRow } from "@/components/shop/line-row";
import { money } from "@/lib/shop/format";
import { closeCart, openCart, useCart, useCartOpen, useWishlist } from "@/lib/shop/store";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The cart, without leaving the page.
 *
 * It opens on every add — the confirmation that something happened is the
 * drawer itself, not a toast that disappears before it is read. The cart page
 * still exists for the long version; this is the glance.
 */
export function CartDrawer() {
  const open = useCartOpen();
  const cart = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.dataset.lock = "true";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.dataset.lock = "false";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cart"
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />

          <motion.aside
            className="slab-ink absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col border-l-2 border-line"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
          >
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b-2 border-line px-7">
              <p className="tag">
                Cart
                <span className="ml-3 text-accent tabular-nums">
                  {String(cart.count).padStart(2, "0")}
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                className="tag-sm group flex items-center gap-3 text-muted transition-colors hover:text-fg"
              >
                Close
                <span className="relative grid size-6 place-items-center">
                  <span className="absolute h-px w-5 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
                  <span className="absolute h-px w-5 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[45deg]" />
                </span>
              </button>
            </div>

            {cart.lines.length === 0 ? (
              <EmptyDrawer />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-7">
                  <AnimatePresence initial={false} mode="popLayout">
                    {cart.lines.map((line) => (
                      <LineRow
                        key={line.id}
                        line={line}
                        variant="compact"
                        onQty={
                          line.kind === "catalogue"
                            ? (qty) => cart.setQty(line.id, qty)
                            : undefined
                        }
                        onRemove={() => cart.remove(line.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="shrink-0 border-t-2 border-line p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[14px] text-muted">Subtotal</p>
                    <p className="d4 tabular-nums">{money(cart.subtotalCents)}</p>
                  </div>
                  <p className="mt-3 text-[12px] leading-snug text-faint">
                    Shipping and tax are settled at checkout, once there is somewhere to send it.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      href="/store/checkout"
                      onClick={closeCart}
                      className="btn btn-solid w-full"
                    >
                      Checkout
                    </Link>
                    <Link href="/store/cart" onClick={closeCart} className="btn w-full">
                      View cart
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyDrawer() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-6 px-7">
      <p className="tag-sm text-accent">Empty</p>
      <p className="d3 max-w-[10ch]">
        Nothing <span className="thin text-gold">yet</span>.
      </p>
      <p className="lede max-w-xs">
        Fourteen objects, all of them printed in Ontario from Ethiopian form.
      </p>
      <div className="mt-2 flex flex-col gap-3 self-stretch">
        <Link href="/store" onClick={closeCart} className="btn btn-solid w-full">
          Browse the shop
        </Link>
        <Link href="/store/custom" onClick={closeCart} className="btn w-full">
          Upload a model
        </Link>
      </div>
    </div>
  );
}

/**
 * The header control. Renders the count from the same store the drawer reads,
 * so it is right the moment the drawer hydrates and never a frame later.
 */
export function CartButton({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Cart — ${count} item${count === 1 ? "" : "s"}`}
      className={className}
    >
      <span className="hidden sm:inline">Cart</span>
      <span className="relative ml-0 inline-flex items-center sm:ml-3">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M4 7h16l-1.4 12.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8Z" />
          <path d="M8.5 7V5.6a3.5 3.5 0 0 1 7 0V7" />
        </svg>
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute -right-2.5 -top-2 grid min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold leading-[18px] text-ink tabular-nums"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}

/** The saved-objects count, for the header rail. */
export function WishlistLink({ className }: { className?: string }) {
  const { count } = useWishlist();

  return (
    <Link href="/store/wishlist" aria-label={`Saved — ${count}`} className={className}>
      <span className="hidden sm:inline">Saved</span>
      <span className="ml-2 tabular-nums text-gold">{count > 0 ? count : ""}</span>
    </Link>
  );
}
