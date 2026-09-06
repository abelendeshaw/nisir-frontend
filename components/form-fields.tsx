"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CapabilityField } from "@/lib/capabilities";

/** Shared shell: micro-label, control slot, and an underline that lights gold on focus. */
function Field({
  label,
  htmlFor,
  className,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("group relative", className)}>
      <label htmlFor={htmlFor} className="label block text-[10px] text-subtle">
        {label}
      </label>
      <div className="relative mt-3">
        {children}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-focus-within:scale-x-100" />
      </div>
      {hint ? <p className="mt-2 text-[11px] text-subtle">{hint}</p> : null}
    </div>
  );
}

const controlClass =
  "w-full appearance-none bg-transparent pb-3 pt-1 text-[15px] text-fg outline-none placeholder:text-subtle/70";

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={controlClass}
      />
    </Field>
  );
}

export function TextAreaField({
  name,
  label,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} className={className}>
      <textarea
        id={id}
        name={name}
        rows={4}
        placeholder={placeholder}
        className={cn(controlClass, "min-h-32 resize-y")}
      />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  options,
  className,
}: {
  name: string;
  label: string;
  options: string[];
  className?: string;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} className={className}>
      <select id={id} name={name} defaultValue="" className={cn(controlClass, "cursor-pointer pr-8")}>
        <option value="" disabled>
          Select
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-surface-solid text-fg">
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1 top-1.5 text-accent">⌄</span>
    </Field>
  );
}

export function NumberField({
  name,
  label,
  className,
}: {
  name: string;
  label: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} className={className}>
      <input id={id} name={name} type="number" min={0} placeholder="0" className={controlClass} />
    </Field>
  );
}

export function DimensionsField() {
  return (
    <div className="sm:col-span-2">
      <p className="label text-[10px] text-subtle">Target dimensions</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { name: "length", placeholder: "Length" },
          { name: "width", placeholder: "Width" },
          { name: "height", placeholder: "Height" },
        ].map((dimension) => (
          <input
            key={dimension.name}
            name={dimension.name}
            placeholder={dimension.placeholder}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none transition-colors focus:border-accent"
          />
        ))}
        <select
          name="unit"
          defaultValue="mm"
          className="cursor-pointer rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none transition-colors focus:border-accent"
        >
          <option value="mm" className="bg-surface-solid">
            mm
          </option>
          <option value="cm" className="bg-surface-solid">
            cm
          </option>
        </select>
      </div>
    </div>
  );
}

/** Drag-and-drop upload with the 100MB per-file ceiling enforced client-side. */
export function FileField({
  name,
  label,
  accept,
  hint,
  maxBytes,
}: {
  name: string;
  label: string;
  accept: string;
  hint: string;
  maxBytes: number;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const maxLabel = `${Math.round(maxBytes / 1024 / 1024)}MB`;

  function validate(list: FileList | null) {
    if (!list?.length) {
      setFiles([]);
      return;
    }
    const oversized = Array.from(list).find((file) => file.size > maxBytes);
    if (oversized) {
      setError(`${oversized.name} is larger than ${maxLabel}.`);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError(null);
    setFiles(Array.from(list).map((file) => file.name));
  }

  return (
    <div className="sm:col-span-2">
      <p className="label text-[10px] text-subtle">{label}</p>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (inputRef.current) inputRef.current.files = event.dataTransfer.files;
          validate(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors duration-300",
          dragging ? "border-accent bg-surface" : "border-line-strong hover:border-accent",
        )}
      >
        <span className="text-2xl text-accent">↑</span>
        <span className="text-sm text-fg">
          Drop files here or <span className="text-accent underline underline-offset-4">browse</span>
        </span>
        <span className="text-[11px] text-subtle">{hint}</span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          name={name}
          multiple
          accept={accept}
          className="sr-only"
          onChange={(event) => validate(event.target.files)}
        />
      </label>

      {files.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {files.map((file) => (
            <li
              key={file}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-muted"
            >
              {file}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-3 text-[12px] text-red-400">{error}</p> : null}
    </div>
  );
}

/** Renders one capability's qualifying questions from its data-driven config. */
export function CapabilityFields({ fields }: { fields: CapabilityField[] }) {
  return (
    <>
      {fields.map((field) => {
        switch (field.type) {
          case "select":
            return (
              <SelectField
                key={field.name}
                name={field.name}
                label={field.label}
                options={field.options}
              />
            );
          case "number":
            return <NumberField key={field.name} name={field.name} label={field.label} />;
          case "dimensions":
            return <DimensionsField key="dimensions" />;
          case "file":
            return (
              <FileField
                key={field.name}
                name={field.name}
                label={field.label}
                accept={field.accept}
                hint={field.hint}
                maxBytes={field.maxBytes}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
