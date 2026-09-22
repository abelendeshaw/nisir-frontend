"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/actions/admin";
import { button, control, FormMessage, Label } from "@/components/admin/ui";
import { Mark } from "@/components/chrome/mark";
import type { AdminFormState } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * The admin sign-in. Separate from the storefront's on purpose, and plainer:
 * no "create an account", no "forgot your password" — an admin's password is
 * reset from a shell with `php artisan nisir:admin --reset-password`, so this
 * form offers nothing to anyone who does not already have one.
 */
export function AdminLoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(adminLogin, undefined);

  return (
    <div className="slab-ink grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Mark className="w-12 text-gold" />
        <h1 className="mt-8 text-[32px] font-extrabold uppercase leading-none tracking-[-0.04em]">
          Admin <span className="font-extralight text-gold">sign in</span>
        </h1>

        {expired && (
          <p role="status" className="mt-6 border-l-2 border-gold pl-4 text-[13px] leading-relaxed text-muted">
            That session has ended — it expired, or was signed out elsewhere. Sign in again.
          </p>
        )}

        <form action={action} className="mt-10 flex flex-col gap-6">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              autoFocus
              className={control}
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={control}
            />
          </div>

          <FormMessage state={state} />

          <button
            type="submit"
            disabled={pending}
            className={cn(button.base, "border-gold bg-gold text-ink hover:border-bone hover:bg-bone")}
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
