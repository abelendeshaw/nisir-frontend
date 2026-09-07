"use client";

import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fields are rules, not boxes.
 *
 * Every control is a baseline with a label above it; focus draws a gold line
 * across that baseline from the left. It keeps a long form reading as a
 * document rather than a stack of widgets, which is the only way seven
 * service forms can share one visual language.
 */

function Shell({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("group relative", className)}>
      <label htmlFor={htmlFor} className="tag-sm block text-faint transition-colors duration-300 group-focus-within:text-accent">
        {label}
      </label>
      <div className="relative mt-3">
        {children}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-x-100" />
      </div>
      {hint && <p className="mt-2 text-[12px] leading-snug text-faint">{hint}</p>}
    </div>
  );
}

const control =
  "w-full bg-transparent pb-3 text-[15px] text-fg outline-none placeholder:text-faint";

export function TextField({
  name,
  label,
  type = "text",
  required,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={control}
      />
    </Shell>
  );
}

export function TextArea({
  name,
  label,
  required,
  placeholder,
  rows = 4,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={cn(control, "resize-none")}
      />
    </Shell>
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
  options: readonly string[];
  className?: string;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <select id={id} name={name} className={cn(control, "cursor-pointer appearance-none pr-8")}>
        {options.map((option) => (
          <option key={option} value={option} className="bg-bg text-fg">
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute bottom-4 right-0 text-[10px] text-faint" aria-hidden>
        ▾
      </span>
    </Shell>
  );
}

export function NumberField({
  name,
  label,
  className,
  min = 1,
}: {
  name: string;
  label: string;
  className?: string;
  min?: number;
}) {
  const id = useId();
  return (
    <Shell label={label} htmlFor={id} className={className}>
      <input id={id} name={name} type="number" min={min} placeholder="1" className={control} />
    </Shell>
  );
}

/** Width / height / depth with a unit, on one baseline. */
export function DimensionsField({ className }: { className?: string }) {
  return (
    <div className={cn("group", className)}>
      <p className="tag-sm text-faint transition-colors duration-300 group-focus-within:text-accent">
        Approximate dimensions
      </p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { name: "width", label: "W" },
            { name: "height", label: "H" },
            { name: "depth", label: "D" },
          ] as const
        ).map((axis) => (
          <div key={axis.name} className="relative flex items-baseline gap-2">
            <span className="tag-sm text-faint">{axis.label}</span>
            <input
              name={axis.name}
              type="number"
              min={0}
              placeholder="0"
              aria-label={`${axis.label} dimension`}
              className={cn(control, "pb-2")}
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
          </div>
        ))}
        <div className="relative">
          <select
            name="unit"
            aria-label="Unit"
            className={cn(control, "cursor-pointer appearance-none pb-2")}
            defaultValue="mm"
          >
            {["mm", "cm", "in"].map((unit) => (
              <option key={unit} value={unit} className="bg-bg text-fg">
                {unit}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
        </div>
      </div>
    </div>
  );
}

/** Reference files, with the size limit enforced before anything is sent. */
export function FileField({
  name,
  label,
  accept,
  hint,
  maxBytes,
  className,
}: {
  name: string;
  label: string;
  accept: string;
  hint: string;
  maxBytes: number;
  className?: string;
}) {
  const id = useId();
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  function take(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    const tooBig = picked.find((file) => file.size > maxBytes);
    if (tooBig) {
      setError(`${tooBig.name} is over the ${Math.round(maxBytes / 1_048_576)}MB limit.`);
      setFiles([]);
      return;
    }
    setError(null);
    setFiles(picked.map((file) => `${file.name} · ${(file.size / 1_048_576).toFixed(1)}MB`));
  }

  return (
    <div className={className}>
      <p className="tag-sm text-faint">{label}</p>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          take(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex cursor-pointer flex-col items-start gap-2 border border-dashed p-6 transition-colors duration-300",
          over ? "border-accent bg-accent/5" : "border-line hover:border-line-strong",
        )}
      >
        <span className="text-[15px] text-fg">
          Drop files here, or <span className="text-accent underline underline-offset-4">browse</span>
        </span>
        <span className="text-[12px] leading-snug text-faint">{hint}</span>
        <input
          id={id}
          name={name}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(event) => take(event.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {files.map((file) => (
            <li key={file} className="tag-sm text-muted">
              ✓ {file}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-[13px] text-accent">{error}</p>}
    </div>
  );
}
