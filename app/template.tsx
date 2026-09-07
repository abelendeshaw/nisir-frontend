"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

/**
 * Every route change lifts and un-blurs rather than snapping. `template.tsx`
 * remounts on navigation, which is exactly the hook this needs.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
