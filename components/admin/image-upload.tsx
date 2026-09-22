"use client";

import { useActionState } from "react";
import { uploadProductImage } from "@/app/actions/admin";
import { button, FieldError, FormMessage } from "@/components/admin/ui";
import type { AdminFormState } from "@/lib/admin/types";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Replaces a product's photograph. The old upload is deleted by the API once this one is in place. */
export function ImageUpload({ slug, image, name }: { slug: string; image?: string; name: string }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    uploadProductImage.bind(null, slug),
    undefined,
  );
  const hydrated = useHydrated();

  return (
    <div className="flex flex-col gap-4">
      {image ? (
        // A plain <img>: this is the API's host, which `next/image` would need
        // configuring for, and an admin thumbnail gains nothing from it.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="aspect-4/5 w-full border-2 border-line object-cover" />
      ) : (
        <p className="grid aspect-4/5 place-items-center border-2 border-dashed border-line px-6 text-center text-[13px] text-faint">
          No photograph yet — the shop draws its procedural figure instead.
        </p>
      )}

      <form action={action} className="flex flex-col gap-3">
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="text-[13px] file:mr-3 file:border-2 file:border-line-strong file:bg-transparent file:px-3 file:py-2 file:text-[11px] file:font-bold file:uppercase file:tracking-[0.14em]"
        />
        <p className="text-[12px] text-faint">JPG, PNG or WebP, up to 5 MB, at least 200px across.</p>
        <FieldError messages={state?.errors?.image} />
        {!state?.errors?.image && <FormMessage state={state} />}
        <button type="submit" disabled={!hydrated || pending} className={cn(button.base, button.ghost)}>
          {pending ? "Uploading…" : "Upload photograph"}
        </button>
      </form>
    </div>
  );
}
