import Link from "next/link";
import { Mark } from "@/components/chrome/mark";

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative grid min-h-[80svh] place-items-center overflow-hidden px-[var(--gutter)] py-32 text-center"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 block w-[80vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2 text-fg/[0.05]"
      >
        <Mark className="w-full animate-drift" />
      </span>
      <div className="relative">
        <p className="tag-sm text-accent">Error 404</p>
        <h1 className="d2 mt-7 max-w-[14ch]">
          Nothing at this <span className="thin text-gold">altitude</span>.
        </h1>
        <p className="lede mx-auto mt-7 max-w-md">
          The page you asked for has moved or never existed. The index below has everywhere that
          does.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn btn-solid">
            Back to index
          </Link>
          <Link href="/services" className="btn btn-ghost">
            Services
          </Link>
        </div>
      </div>
    </main>
  );
}
