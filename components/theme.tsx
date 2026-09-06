"use client";

import { cn } from "@/lib/utils";
import { THEME_STORAGE_KEY } from "@/lib/theme";

function applyTheme() {
  const root = document.documentElement;
  const current =
    root.getAttribute("data-theme") ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* private mode — the choice just won't persist */
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    // Cross-fade the whole document where the browser supports it.
    const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motionOk && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className={cn(
        "group relative grid size-11 place-items-center rounded-full border border-line",
        "text-fg transition-colors duration-500 hover:border-accent-bright hover:text-accent-bright",
        className,
      )}
    >
      {/* Sun shows on night mode (click for day), moon on day mode. */}
      <svg
        className="only-dark size-[18px] transition-transform duration-500 group-hover:rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
      </svg>
      <svg
        className="only-light size-[18px] transition-transform duration-500 group-hover:-rotate-12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z" />
      </svg>
    </button>
  );
}
