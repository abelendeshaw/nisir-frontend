"use client";

import { button } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * What the panel shows when the API cannot be asked — down, or answering 500.
 *
 * The admin guard fails closed, so this is also what an unconfirmable session
 * looks like: nothing from the panel, and a way to try again.
 */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="border-2 border-line bg-surface p-8">
      <p className="marker tag-sm">Something went wrong</p>
      <h1 className="mt-4 text-[28px] font-extrabold uppercase leading-none tracking-[-0.04em]">
        Couldn’t load this screen
      </h1>
      <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted">
        The API didn’t answer, or answered with an error. Nothing was changed. If it keeps happening,
        check that nisir-backend-php is running and that <code>NISIR_API_URL</code> points at it.
      </p>
      <button type="button" onClick={reset} className={cn(button.base, button.primary, "mt-6")}>
        Try again
      </button>
    </div>
  );
}
