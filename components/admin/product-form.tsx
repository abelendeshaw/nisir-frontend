"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/actions/admin";
import { button, control, FieldError, FormMessage, Label, Panel } from "@/components/admin/ui";
import type { AdminFormState, AdminProduct, ProductOptions } from "@/lib/admin/types";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Create or edit a product.
 *
 * Field names are the admin action's (`price` in dollars, `dimsW`…); the
 * errors that come back are the API's (`baseCents`, `dimsMm.0`…), so each
 * field names the API key it answers for.
 */
export function ProductForm({ product, options }: { product?: AdminProduct; options: ProductOptions }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveProduct, undefined);
  const errors = state?.errors ?? {};
  const isNew = product === undefined;
  const hydrated = useHydrated();

  /** Every message under a key, including its array members: `dimsMm` and `dimsMm.1`. */
  const errorsFor = (key: string) =>
    Object.entries(errors)
      .filter(([field]) => field === key || field.startsWith(`${key}.`))
      .flatMap(([, messages]) => messages);

  return (
    <form action={action} className="flex flex-col gap-6">
      {product && <input type="hidden" name="originalSlug" value={product.slug} />}

      <Panel title="Identity">
        <div className="grid gap-5 md:grid-cols-2">
          <Text name="name" label="Name" defaultValue={product?.name} required errors={errorsFor("name")} />
          <Text
            name="slug"
            label="Slug (its address in the shop)"
            defaultValue={product?.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            hint={`Lowercase words joined by hyphens. Not: ${options.reservedSlugs.join(", ")}.`}
            errors={errorsFor("slug")}
          />
          <Text name="line" label="One line about it" defaultValue={product?.line} required errors={errorsFor("line")} />
          <Text name="number" label="Catalogue number" defaultValue={product?.number} required errors={errorsFor("number")} />
          <Select
            name="category"
            label="Category"
            defaultValue={product?.category}
            values={options.categories}
            errors={errorsFor("category")}
          />
          <div>
            <Label htmlFor="collection">Collection</Label>
            <input
              id="collection"
              name="collection"
              list="collections"
              defaultValue={product?.collection}
              required
              className={control}
            />
            <datalist id="collections">
              {options.collections.map((collection) => (
                <option key={collection} value={collection} />
              ))}
            </datalist>
            <FieldError messages={errorsFor("collection")} />
          </div>
          <Select
            name="relic"
            label="Drawing (shown until a photograph is uploaded)"
            defaultValue={product?.relic}
            values={options.relics}
            errors={errorsFor("relic")}
          />
          <Text
            name="sortOrder"
            label="Position in the shop"
            type="number"
            defaultValue={String(product?.sortOrder ?? 0)}
            hint="Lower comes first."
            errors={errorsFor("sortOrder")}
          />
        </div>
      </Panel>

      <Panel title="Price and options">
        <div className="grid gap-5 md:grid-cols-3">
          <Text
            name="price"
            label="Base price (CAD)"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? (product.baseCents / 100).toFixed(2) : ""}
            required
            hint="The first size, in the first material."
            errors={errorsFor("baseCents")}
          />
          {isNew && (
            <Text
              name="stock"
              label="Opening stock"
              type="number"
              min="0"
              defaultValue="0"
              hint="After this, use the stock panel."
              errors={errorsFor("stock")}
            />
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <OptionPicker name="materials" label="Materials" all={options.materials} initial={product?.materials} errors={errorsFor("materials")} />
          <OptionPicker name="finishes" label="Finishes" all={options.finishes} initial={product?.finishes} errors={errorsFor("finishes")} />
          <OptionPicker name="sizes" label="Sizes" all={options.sizes} initial={product?.sizes} errors={errorsFor("sizes")} />
        </div>
      </Panel>

      <Panel title="Making it">
        <div className="grid gap-5 md:grid-cols-3">
          <Text name="dimsW" label="Width (mm)" type="number" min="0" defaultValue={product ? String(product.dimsMm[0]) : ""} required errors={errorsFor("dimsMm")} />
          <Text name="dimsH" label="Height (mm)" type="number" min="0" defaultValue={product ? String(product.dimsMm[1]) : ""} required />
          <Text name="dimsD" label="Depth (mm)" type="number" min="0" defaultValue={product ? String(product.dimsMm[2]) : ""} required />
          <Text name="weightG" label="Weight (g)" type="number" min="0" defaultValue={product ? String(product.weightG) : ""} required errors={errorsFor("weightG")} />
          <Text
            name="volumeCm3"
            label="Volume (cm³)"
            type="number"
            step="0.1"
            min="0"
            defaultValue={product?.volumeCm3 != null ? String(product.volumeCm3) : ""}
            hint="Measured off the model. Leave blank if not modelled yet."
            errors={errorsFor("volumeCm3")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Text name="leadMin" label="Lead (min days)" type="number" min="0" defaultValue={product ? String(product.leadDays[0]) : ""} required errors={errorsFor("leadDays")} />
            <Text name="leadMax" label="Lead (max days)" type="number" min="0" defaultValue={product ? String(product.leadDays[1]) : ""} required />
          </div>
        </div>
      </Panel>

      <Panel title="Story">
        <div className="grid gap-5">
          <div>
            <Label htmlFor="story">Story</Label>
            <textarea id="story" name="story" rows={5} required defaultValue={product?.story} className={cn(control, "h-auto py-2 leading-relaxed")} />
            <FieldError messages={errorsFor("story")} />
          </div>
          <div>
            <Label htmlFor="notes">Notes — one per line</Label>
            <textarea id="notes" name="notes" rows={4} defaultValue={product?.notes.join("\n")} className={cn(control, "h-auto py-2 leading-relaxed")} />
            <FieldError messages={errorsFor("notes")} />
          </div>
        </div>
      </Panel>

      <Panel title="On the shelf">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <Check name="active" label="For sale" hint="Off retires it without deleting it — old receipts still render." defaultChecked={product?.active ?? true} />
          <Check name="featured" label="Featured" hint="Shown first in the shop." defaultChecked={product?.featured ?? false} />
          <Check name="digital" label="Digital download" hint="No stock, no shipping." defaultChecked={product?.digital ?? false} />
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={!hydrated || pending} className={cn(button.base, button.primary)}>
          {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

function Text({
  name,
  label,
  hint,
  errors,
  ...input
}: {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input id={name} name={name} {...input} aria-invalid={errors?.length ? true : undefined} className={control} />
      {hint && !errors?.length && <p className="mt-1.5 text-[12px] leading-snug text-faint">{hint}</p>}
      <FieldError messages={errors} />
    </div>
  );
}

function Select({
  name,
  label,
  values,
  defaultValue,
  errors,
}: {
  name: string;
  label: string;
  values: string[];
  defaultValue?: string;
  errors?: string[];
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue ?? values[0]} required className={control}>
        {values.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <FieldError messages={errors} />
    </div>
  );
}

function Check({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  return (
    <label className="flex max-w-xs cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--gold-deep)]" />
      <span>
        <span className="block text-[14px] text-fg">{label}</span>
        <span className="block text-[12px] leading-snug text-faint">{hint}</span>
      </span>
    </label>
  );
}

/**
 * An ordered choice. A product's first material, finish and size are the
 * configuration it opens on and is priced from, so the order is data — plain
 * checkboxes would re-sort it into the table's order on every save and
 * quietly change what the product shows first.
 */
function OptionPicker({
  name,
  label,
  all,
  initial,
  errors,
}: {
  name: string;
  label: string;
  all: { id: string; name: string; active: boolean }[];
  initial?: string[];
  errors?: string[];
}) {
  const [chosen, setChosen] = useState<string[]>(initial ?? (all[0] ? [all[0].id] : []));
  const nameOf = (id: string) => all.find((option) => option.id === id)?.name ?? id;

  const toggle = (id: string) =>
    setChosen((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  const makeDefault = (id: string) => setChosen((current) => [id, ...current.filter((entry) => entry !== id)]);

  return (
    <fieldset>
      <legend className="tag-sm mb-2 block text-faint">{label}</legend>
      {chosen.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <ul className="flex flex-col gap-1.5">
        {all.map((option) => {
          const index = chosen.indexOf(option.id);
          return (
            <li key={option.id} className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={index !== -1}
                  onChange={() => toggle(option.id)}
                  className="size-4 accent-[var(--gold-deep)]"
                />
                <span className={cn(!option.active && "text-faint line-through")}>{option.name}</span>
              </label>
              {index === 0 ? (
                <span className="tag-sm text-gold-deep">Default</span>
              ) : index > 0 ? (
                <button type="button" onClick={() => makeDefault(option.id)} className="tag-sm text-faint hover:text-fg">
                  Make default
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {chosen.length > 0 && (
        <p className="mt-2 text-[12px] text-faint">Opens on {nameOf(chosen[0])}.</p>
      )}
      <FieldError messages={errors} />
    </fieldset>
  );
}
