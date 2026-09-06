import { Manrope } from "next/font/google";

/**
 * Global typeface.
 *
 * The brand calls for PP Mori (Pangram Pangram) — a licensed font, so it can't
 * be fetched or bundled here. Manrope is the stand-in: same geometric-grotesk
 * skeleton, tall x-height, and it holds up at both 11px micro-labels and
 * 140px display sizes.
 *
 * TO SWAP IN THE REAL MORI:
 *   1. Drop PPMori-Regular.woff2 / PPMori-SemiBold.woff2 / PPMori-Extralight.woff2
 *      into app/fonts/
 *   2. Replace the export below with:
 *
 *      import localFont from "next/font/local";
 *      export const sans = localFont({
 *        variable: "--font-mori",
 *        display: "swap",
 *        src: [
 *          { path: "../app/fonts/PPMori-Extralight.woff2", weight: "200", style: "normal" },
 *          { path: "../app/fonts/PPMori-Regular.woff2", weight: "400", style: "normal" },
 *          { path: "../app/fonts/PPMori-SemiBold.woff2", weight: "600", style: "normal" },
 *        ],
 *      });
 *
 * Nothing else in the app references the family by name — everything reads
 * the --font-mori CSS variable.
 */
export const sans = Manrope({
  variable: "--font-mori",
  subsets: ["latin"],
  display: "swap",
});
