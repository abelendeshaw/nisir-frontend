import { Inter } from "next/font/google";

/**
 * One family. Inter, variable, across the whole site.
 *
 * Contrast comes from weight, not from a second or third typeface: display
 * type sits at 800 with tracking pulled in hard, accent words drop to 200, and
 * everything structural lives at 400–600. A single family used across that
 * range reads as art direction; three families read as indecision.
 */
export const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const fontVariables = sans.variable;
