"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useStillness } from "@/lib/hooks";
import type { PlateKind } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * Plates.
 *
 * There is no photography in this practice yet, and grey placeholder boxes
 * would undo everything else on the page. So each service draws its own
 * figure instead: a hairline construction in ink and gold, one per discipline,
 * slow enough to read as a diagram rather than a loading state.
 *
 * They are deterministic — same slug, same drawing, every render — so the
 * site never flickers between server and client.
 */

const VIEW = { w: 400, h: 500 };

export function Plate({
  kind,
  className,
  label,
  index,
  variant = 0,
}: {
  kind: PlateKind;
  className?: string;
  label?: string;
  index?: string;
  /** Deterministic tilt/zoom, so a row of plates never reads as a repeat. */
  variant?: number;
}) {
  // Golden-ratio stride: successive variants land far apart, and variant 0 is
  // always the untouched drawing.
  const tilt = variant === 0 ? 0 : ((variant * 37) % 15) - 7;
  const zoom = variant === 0 ? 1 : 0.9 + ((variant * 29) % 7) / 40;
  const id = useId().replace(/[:]/g, "");
  const reduced = useStillness();

  return (
    <div
      className={cn(
        "group/plate relative isolate overflow-hidden border-2 border-line bg-surface",
        className,
      )}
    >
      {/* The glow lives on the container, not in the SVG, so the figure can be
          letterboxed into any aspect ratio without the light being cropped. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, color-mix(in srgb, var(--gold) 26%, transparent), transparent 72%)",
        }}
      />
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold-lit)" />
            <stop offset="55%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        <g
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          className="text-fg/45 transition-[opacity,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/plate:scale-[1.04]"
          style={{
            transformOrigin: "center",
            transform: `rotate(${tilt}deg) scale(${zoom})`,
          }}
        >
          <Figure kind={kind} id={id} reduced={!!reduced} />
        </g>
      </svg>

      {/* A gold sweep crosses the plate on hover. */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/12 to-transparent transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/plate:translate-x-full"
        aria-hidden
      />

      {(label || index) && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          {label && <span className="tag-sm text-muted">{label}</span>}
          {index && <span className="tag-sm text-accent">{index}</span>}
        </div>
      )}
    </div>
  );
}

function Figure({ kind, id, reduced }: { kind: PlateKind; id: string; reduced: boolean }) {
  const gold = `url(#${id}-gold)`;
  const spin = { rotate: 360 };
  const slowSpin = { duration: 64, repeat: Infinity, ease: "linear" as const };

  switch (kind) {
    /* Web — a modular grid, three cells taken. */
    case "grid": {
      const cells = [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [0, 3],
        [1, 3],
        [2, 3],
      ];
      const filled = new Set(["1-1", "2-2", "0-3"]);
      return (
        <>
          {cells.map(([cx, cy]) => {
            const key = `${cx}-${cy}`;
            const x = 60 + cx * 94;
            const y = 70 + cy * 94;
            return (
              <motion.rect
                key={key}
                x={x}
                y={y}
                width="88"
                height="88"
                fill={filled.has(key) ? gold : "none"}
                fillOpacity={filled.has(key) ? 0.9 : 0}
                initial={reduced ? false : { opacity: 0.35 }}
                animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: (cx + cy) * 0.28,
                  ease: "easeInOut",
                }}
              />
            );
          })}
          <line x1="60" y1="446" x2="342" y2="446" stroke={gold} strokeWidth="2" />
        </>
      );
    }

    /* Apps — screens receding into depth. */
    case "stack":
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.rect
              key={i}
              x={92 + i * 14}
              y={90 + i * 34}
              width="180"
              height="260"
              rx="18"
              stroke={i === 0 ? gold : "currentColor"}
              strokeWidth={i === 0 ? 2 : 1}
              opacity={1 - i * 0.22}
              initial={reduced ? false : { y: 0 }}
              animate={reduced ? undefined : { y: [0, -9, 0] }}
              transition={{ duration: 7, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
            />
          ))}
          <circle cx="182" cy="330" r="4" fill={gold} />
        </>
      );

    /* Brand — one mass, one void, held in tension. */
    case "solid":
      return (
        <>
          <motion.circle
            cx="168"
            cy="212"
            r="112"
            fill={gold}
            fillOpacity="0.92"
            stroke="none"
            initial={reduced ? false : { scale: 1 }}
            animate={reduced ? undefined : { scale: [1, 1.045, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "168px 212px" }}
          />
          <rect x="196" y="240" width="164" height="164" strokeWidth="1.5" />
          <line x1="40" y1="440" x2="360" y2="440" />
          <line x1="40" y1="60" x2="360" y2="60" />
        </>
      );

    /* Motion — the same curve, phase-shifted. */
    case "wave":
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.path
              key={i}
              d={`M 30 ${150 + i * 50} C 110 ${100 + i * 50}, 180 ${210 + i * 50}, 250 ${
                160 + i * 50
              } S 360 ${110 + i * 50}, 380 ${150 + i * 50}`}
              stroke={i === 2 ? gold : "currentColor"}
              strokeWidth={i === 2 ? 2 : 1}
              opacity={i === 2 ? 1 : 0.55}
              initial={reduced ? false : { pathLength: 0.2, x: 0 }}
              animate={reduced ? undefined : { pathLength: 1, x: [0, -22, 0] }}
              transition={{
                pathLength: { duration: 2.2, ease: "easeOut" },
                x: { duration: 8, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" },
              }}
            />
          ))}
        </>
      );

    /* 3D modelling — a wireframe volume, rotating on one axis. */
    case "lattice": {
      const pts = [
        [130, 150],
        [270, 110],
        [330, 190],
        [190, 232],
      ];
      const depth = 120;
      return (
        <motion.g
          initial={reduced ? false : { rotate: -3 }}
          animate={reduced ? undefined : { rotate: [-3, 3, -3] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "230px 250px" }}
        >
          <polygon points={pts.map(([x, y]) => `${x},${y}`).join(" ")} strokeWidth="1.5" />
          <polygon
            points={pts.map(([x, y]) => `${x},${y + depth}`).join(" ")}
            stroke={gold}
            strokeWidth="1.5"
          />
          {pts.map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={x} y2={y + depth} />
          ))}
          {pts.map(([x, y], i) => (
            <circle key={`v${i}`} cx={x} cy={y} r="3.5" fill={gold} stroke="none" />
          ))}
        </motion.g>
      );
    }

    /* 3D printing — deposited rings, laid down one layer at a time. */
    case "orbit":
      return (
        <>
          {[150, 118, 86, 54].map((r, i) => (
            <motion.circle
              key={r}
              cx="200"
              cy="250"
              r={r}
              stroke={i === 1 ? gold : "currentColor"}
              strokeWidth={i === 1 ? 2 : 1}
              strokeDasharray={i % 2 ? "5 9" : undefined}
              initial={reduced ? false : { rotate: 0 }}
              animate={reduced ? undefined : { rotate: i % 2 ? -360 : 360 }}
              transition={{ ...slowSpin, duration: 40 + i * 16 }}
              style={{ transformOrigin: "200px 250px" }}
            />
          ))}
          <motion.circle
            cx="200"
            cy="100"
            r="6"
            fill={gold}
            stroke="none"
            initial={reduced ? false : { rotate: 0 }}
            animate={reduced ? undefined : spin}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "200px 250px" }}
          />
          <line x1="200" y1="418" x2="200" y2="452" stroke={gold} strokeWidth="2" />
        </>
      );

    /* Fashion — warp and weft. */
    case "weave":
      return (
        <>
          {Array.from({ length: 11 }, (_, i) => (
            <motion.line
              key={`w${i}`}
              x1={50 + i * 30}
              y1="80"
              x2={50 + i * 30}
              y2="420"
              stroke={i === 5 ? gold : "currentColor"}
              strokeWidth={i === 5 ? 2 : 1}
              initial={reduced ? false : { pathLength: 0 }}
              animate={reduced ? undefined : { pathLength: 1 }}
              transition={{ duration: 1.1, delay: i * 0.05, ease: "easeOut" }}
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.line
              key={`f${i}`}
              x1="50"
              y1={110 + i * 44}
              x2="350"
              y2={110 + i * 44}
              opacity={0.5}
              initial={reduced ? false : { pathLength: 0 }}
              animate={reduced ? undefined : { pathLength: 1 }}
              transition={{ duration: 1.3, delay: 0.4 + i * 0.06, ease: "easeOut" }}
            />
          ))}
        </>
      );
  }
}
