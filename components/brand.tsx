import { cn } from "@/lib/utils";

/**
 * The eagle mark ships in gold (for night) and navy (for daylight); CSS picks
 * the right one from the theme, so this stays a server component.
 *
 * Size these by WIDTH — the images fill the wrapper and keep their ratio.
 */
export function EagleMark({
  className,
  alwaysGold = false,
}: {
  className?: string;
  alwaysGold?: boolean;
}) {
  return (
    <span className={cn("block", className)}>
      <img
        src="/logo/Nisir_Designs_Mark_Gold.svg"
        alt=""
        aria-hidden="true"
        className={cn("h-auto w-full", !alwaysGold && "only-dark")}
      />
      {alwaysGold ? null : (
        <img
          src="/logo/Nisir_Designs_Mark_Blue.svg"
          alt=""
          aria-hidden="true"
          className="only-light h-auto w-full"
        />
      )}
    </span>
  );
}

/**
 * Lockup for the header and footer. The supplied logo SVG stacks the eagle
 * above the wordmark, which turns to mush at nav height — so the mark is used
 * on its own and the wordmark is set in the site typeface beside it.
 */
export function BrandLockup({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <EagleMark alwaysGold={onDark} className="w-9 shrink-0 md:w-10" />
      <span className="leading-none">
        <span
          className={cn(
            "block text-[15px] font-semibold tracking-[0.34em] md:text-[17px]",
            onDark && "text-ivory",
          )}
        >
          NISIR
        </span>
        <span
          className={cn(
            "mt-1.5 block text-[7px] tracking-[0.5em] text-subtle md:text-[8px]",
            onDark && "text-ivory/50",
          )}
        >
          DESIGNS
        </span>
      </span>
    </span>
  );
}
