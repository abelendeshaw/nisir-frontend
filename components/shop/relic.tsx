"use client";

import { motion } from "motion/react";
import { useStillness } from "@/lib/hooks";
import type { RelicKind } from "@/lib/shop/catalog";
import { cn } from "@/lib/utils";

/**
 * Relics.
 *
 * The same argument as `components/ui/plate.tsx`, one floor down: there are no
 * product photographs, and a shop full of grey rectangles would undo the rest
 * of the site. So each object draws the thing it is a reference to — the plan
 * of Bete Giyorgis, the storeys of a stele, a jebena in profile — as a
 * hairline construction in ink and gold.
 *
 * These are drawings of sources, not renders of products. That is the honest
 * position until there is a photographer on the floor, and it happens to be
 * the more interesting one.
 */

const VIEW = { w: 400, h: 500 };

export function Relic({
  kind,
  className,
  label,
  index,
  /** Deterministic lean, so a grid of relics never reads as a repeat. */
  variant = 0,
  quiet = false,
}: {
  kind: RelicKind;
  className?: string;
  label?: string;
  index?: string;
  variant?: number;
  /** Drops the glow and the sweep — for dense rows like the cart. */
  quiet?: boolean;
}) {
  const still = useStillness();
  const tilt = variant === 0 ? 0 : ((variant * 31) % 9) - 4;

  return (
    <div
      className={cn(
        "group/relic relative isolate overflow-hidden border-2 border-line bg-surface",
        className,
      )}
    >
      {!quiet && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 38%, color-mix(in srgb, var(--gold) 24%, transparent), transparent 72%)",
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <g
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          className="text-fg/45 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/relic:scale-[1.035]"
          style={{ transformOrigin: "center", transform: `rotate(${tilt}deg)` }}
        >
          <Figure kind={kind} still={still} />
        </g>
      </svg>

      {!quiet && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/12 to-transparent transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/relic:translate-x-full"
        />
      )}

      {(label || index) && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          {label && <span className="tag-sm text-muted">{label}</span>}
          {index && <span className="tag-sm text-accent">{index}</span>}
        </div>
      )}
    </div>
  );
}

const GOLD = "var(--gold)";

function Figure({ kind, still }: { kind: RelicKind; still: boolean }) {
  switch (kind) {
    /* Lalibela — Bete Giyorgis is a cross cut down into rock, so its plan and
       its elevation are the same drawing. Three nested courses, deepest last. */
    case "cross": {
      const courses = [
        { reach: 168, arm: 56, gold: false },
        { reach: 132, arm: 44, gold: false },
        { reach: 96, arm: 32, gold: true },
      ];
      return (
        <>
          <rect x="18" y="68" width="364" height="364" strokeWidth="1" opacity="0.4" />
          {courses.map((course, i) => (
            <motion.path
              key={course.reach}
              d={greekCross(200, 250, course.reach, course.arm)}
              stroke={course.gold ? GOLD : "currentColor"}
              strokeWidth={course.gold ? 2.5 : 2}
              fill={course.gold ? GOLD : "none"}
              fillOpacity={course.gold ? 0.12 : 0}
              initial={still ? false : { opacity: 0.3 }}
              animate={still ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 7, repeat: Infinity, delay: i * 0.9, ease: "easeInOut" }}
            />
          ))}
        </>
      );
    }

    /* Axum — nine storeys of blind windows over a false door. */
    case "stele": {
      const top = 60;
      const bottom = 430;
      const storeys = 9;
      const step = (bottom - top - 60) / storeys;
      return (
        <>
          <path
            d={`M 158 ${bottom} L 158 ${top + 34} Q 200 ${top - 4} 242 ${top + 34} L 242 ${bottom} Z`}
            strokeWidth="2.5"
          />
          {Array.from({ length: storeys }, (_, i) => {
            const y = top + 44 + i * step;
            return (
              <motion.g
                key={i}
                initial={still ? false : { opacity: 0.25 }}
                animate={still ? undefined : { opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 0.24, ease: "easeInOut" }}
              >
                <line x1="158" y1={y} x2="242" y2={y} strokeWidth="1" />
                <circle cx="176" cy={y - 8} r="3" fill="currentColor" stroke="none" />
                <circle cx="224" cy={y - 8} r="3" fill="currentColor" stroke="none" />
              </motion.g>
            );
          })}
          {/* The false door: the whole point of the object. */}
          <rect x="174" y={bottom - 52} width="52" height="52" stroke={GOLD} strokeWidth="2.5" />
          <line x1="200" y1={bottom - 52} x2="200" y2={bottom} stroke={GOLD} strokeWidth="1" />
          <line x1="118" y1={bottom} x2="282" y2={bottom} strokeWidth="2.5" />
        </>
      );
    }

    /* The jebena in profile: bulb, neck, spout, handle. */
    case "jebena":
      return (
        <>
          <path
            d="M 200 116 C 150 158, 118 214, 118 288 C 118 358, 154 406, 200 406 C 246 406, 282 358, 282 288 C 282 214, 250 158, 200 116 Z"
            strokeWidth="2.5"
          />
          <path d="M 176 116 L 176 88 L 224 88 L 224 116" />
          <path d="M 186 88 L 200 62 L 214 88" stroke={GOLD} strokeWidth="2.5" />
          {/* Spout, left; handle, right. */}
          <path d="M 122 232 C 88 214, 66 186, 62 156" strokeWidth="2.5" />
          <path d="M 278 246 C 322 250, 336 300, 300 330" strokeWidth="2.5" />
          <motion.ellipse
            cx="200"
            cy="288"
            rx="82"
            ry="14"
            stroke={GOLD}
            strokeWidth="1.5"
            initial={still ? false : { opacity: 0.3, cy: 300 }}
            animate={still ? undefined : { opacity: [0.3, 0.9, 0.3], cy: [300, 250, 300] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <line x1="96" y1="440" x2="304" y2="440" strokeWidth="1" opacity="0.5" />
        </>
      );

    /* Mesob — a coil, drawn as the courses it is actually built from. */
    case "mesob": {
      const courses = 11;
      return (
        <>
          {Array.from({ length: courses }, (_, i) => {
            const t = i / (courses - 1);
            const y = 120 + t * 260;
            // Waisted: wide at the mouth, pinched, wide again at the foot.
            const rx = 62 + Math.sin(t * Math.PI) * 34 + t * 46;
            return (
              <motion.ellipse
                key={i}
                cx="200"
                cy={y}
                rx={rx}
                ry={rx * 0.22}
                stroke={i === 0 ? GOLD : "currentColor"}
                strokeWidth={i === 0 ? 2.5 : 1.5}
                initial={still ? false : { opacity: 0.35 }}
                animate={still ? undefined : { opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            );
          })}
          {/* Warp ticks — the grass running the other way. */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = 200 + Math.cos(angle) * 96;
            return <line key={i} x1={x} y1="150" x2={x} y2="376" strokeWidth="1" opacity="0.28" />;
          })}
        </>
      );
    }

    /* Tibeb — the woven border, three bands, the middle one gold. */
    case "tibeb": {
      const bands = [
        { y: 140, gold: false, step: 40 },
        { y: 250, gold: true, step: 32 },
        { y: 360, gold: false, step: 40 },
      ];
      return (
        <>
          {bands.map((band, b) => {
            const points: string[] = [];
            for (let x = 30; x <= 370; x += band.step) {
              points.push(`${x},${band.y - 22}`, `${x + band.step / 2},${band.y + 22}`);
            }
            return (
              <motion.g
                key={band.y}
                stroke={band.gold ? GOLD : "currentColor"}
                strokeWidth={band.gold ? 2.5 : 2}
                initial={still ? false : { x: 0 }}
                animate={still ? undefined : { x: [0, band.gold ? 32 : -40, 0] }}
                transition={{ duration: 11, repeat: Infinity, delay: b * 0.6, ease: "easeInOut" }}
              >
                <polyline points={points.join(" ")} />
                <line x1="20" y1={band.y - 34} x2="380" y2={band.y - 34} strokeWidth="1" />
                <line x1="20" y1={band.y + 34} x2="380" y2={band.y + 34} strokeWidth="1" />
              </motion.g>
            );
          })}
        </>
      );
    }

    /* Adey abeba — thirteen petals, one per month of the calendar. */
    case "daisy": {
      const petals = 13;
      return (
        <motion.g
          initial={still ? false : { rotate: 0 }}
          animate={still ? undefined : { rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "200px 250px" }}
        >
          {Array.from({ length: petals }, (_, i) => {
            const angle = (i / petals) * 360;
            return (
              <ellipse
                key={i}
                cx="200"
                cy="146"
                rx="24"
                ry="62"
                strokeWidth="2"
                style={{ transformOrigin: "200px 250px", transform: `rotate(${angle}deg)` }}
              />
            );
          })}
          <circle cx="200" cy="250" r="48" fill={GOLD} fillOpacity="0.9" stroke="none" />
          <circle cx="200" cy="250" r="62" stroke={GOLD} strokeWidth="1.5" />
        </motion.g>
      );
    }

    /* Fidel — a letterform under construction, on its own guides. */
    case "fidel": {
      const cap = 120;
      const base = 380;
      const bar = 268;
      return (
        <>
          {[cap, bar, base].map((y, i) => (
            <line
              key={y}
              x1="40"
              y1={y}
              x2="360"
              y2={y}
              strokeWidth="1"
              strokeDasharray={i === 1 ? "4 8" : undefined}
              opacity="0.45"
            />
          ))}
          <motion.g
            stroke={GOLD}
            strokeWidth="14"
            strokeLinecap="square"
            initial={still ? false : { pathLength: 0 }}
            animate={still ? undefined : { pathLength: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d={`M 128 ${cap} L 128 ${base}`} />
            <path d={`M 272 ${cap} L 272 ${base}`} />
            <path d={`M 128 ${bar} L 272 ${bar}`} />
          </motion.g>
          {/* Feet — Ge'ez letters sit down hard on the baseline. */}
          <path d={`M 104 ${base} L 152 ${base}`} strokeWidth="14" stroke={GOLD} />
          <path d={`M 248 ${base} L 296 ${base}`} strokeWidth="14" stroke={GOLD} />
          <circle cx="128" cy={cap} r="7" fill="currentColor" stroke="none" />
          <circle cx="272" cy={cap} r="7" fill="currentColor" stroke="none" />
        </>
      );
    }

    /* Gebeta — twelve pits, two stores, and the stones moving between them. */
    case "gebeta": {
      const pits = 6;
      return (
        <>
          <rect x="26" y="176" width="348" height="148" rx="74" strokeWidth="2.5" />
          <ellipse cx="70" cy="250" rx="26" ry="46" strokeWidth="2" />
          <ellipse cx="330" cy="250" rx="26" ry="46" strokeWidth="2" />
          {Array.from({ length: pits }, (_, i) => {
            const x = 128 + i * 29;
            return (
              <g key={i}>
                {[214, 286].map((y, row) => (
                  <motion.circle
                    key={y}
                    cx={x}
                    cy={y}
                    r="13"
                    stroke={i === 2 && row === 0 ? GOLD : "currentColor"}
                    strokeWidth={i === 2 && row === 0 ? 2.5 : 1.8}
                    fill={i === 2 && row === 0 ? GOLD : "none"}
                    fillOpacity={i === 2 && row === 0 ? 0.16 : 0}
                    initial={still ? false : { opacity: 0.4 }}
                    animate={still ? undefined : { opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      delay: (row * pits + i) * 0.18,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </g>
            );
          })}
          <line x1="26" y1="360" x2="374" y2="360" strokeWidth="1" opacity="0.4" />
        </>
      );
    }

    /* Walia — the horns are the whole recognition. */
    case "ibex": {
      const ridges = 9;
      return (
        <>
          {[-1, 1].map((side) => (
            <g key={side}>
              <path
                d={`M ${200 + side * 22} 300 C ${200 + side * 74} 260, ${200 + side * 116} 176, ${
                  200 + side * 84
                } 88`}
                strokeWidth="3"
              />
              {Array.from({ length: ridges }, (_, i) => {
                const t = (i + 1) / (ridges + 1);
                const x = 200 + side * (22 + t * 82 - t * t * 30);
                const y = 300 - t * 200;
                return (
                  <motion.line
                    key={i}
                    x1={x - 11}
                    y1={y}
                    x2={x + 11}
                    y2={y - 6}
                    strokeWidth="1.6"
                    stroke={i === 4 ? GOLD : "currentColor"}
                    initial={still ? false : { opacity: 0.3 }}
                    animate={still ? undefined : { opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 5.5,
                      repeat: Infinity,
                      delay: i * 0.16,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </g>
          ))}
          <path d="M 178 300 L 200 420 L 222 300 Z" strokeWidth="2.5" />
          <circle cx="200" cy="330" r="4" fill={GOLD} stroke="none" />
        </>
      );
    }

    /* One of the five gates of the Jugol wall. */
    case "gate":
      return (
        <>
          <rect x="46" y="150" width="308" height="270" strokeWidth="2.5" />
          {/* Crenellation. */}
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={46 + i * 44} y="128" width="26" height="22" strokeWidth="1.6" />
          ))}
          <path d="M 140 420 L 140 262 A 60 60 0 0 1 260 262 L 260 420" strokeWidth="2.5" />
          <motion.path
            d="M 160 420 L 160 268 A 40 40 0 0 1 240 268 L 240 420"
            stroke={GOLD}
            strokeWidth="2"
            initial={still ? false : { opacity: 0.35 }}
            animate={still ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          {[100, 300].map((x) => (
            <line key={x} x1={x} y1="150" x2={x} y2="420" strokeWidth="1" opacity="0.45" />
          ))}
          <line x1="26" y1="420" x2="374" y2="420" strokeWidth="2.5" />
        </>
      );

    /* Sheba — the lattice, and the light it is only there to cut. */
    case "lantern": {
      const rows = 5;
      const cols = 6;
      return (
        <>
          <ellipse cx="200" cy="118" rx="86" ry="22" stroke={GOLD} strokeWidth="2.5" />
          <path d="M 114 118 L 114 382" strokeWidth="2.5" />
          <path d="M 286 118 L 286 382" strokeWidth="2.5" />
          <ellipse cx="200" cy="382" rx="86" ry="22" strokeWidth="2.5" />
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const x = 124 + c * 30.4;
              const y = 158 + r * 46;
              return (
                <motion.path
                  key={`${r}-${c}`}
                  d={`M ${x} ${y - 14} L ${x + 15} ${y} L ${x} ${y + 14} L ${x - 15} ${y} Z`}
                  strokeWidth="1.4"
                  fill={GOLD}
                  initial={still ? false : { fillOpacity: 0 }}
                  animate={still ? undefined : { fillOpacity: [0, 0.28, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: (r + c) * 0.22,
                    ease: "easeInOut",
                  }}
                />
              );
            }),
          )}
        </>
      );
    }

    /* Rekebot — the tray the ceremony is set on, with the jebena on it. */
    case "tray": {
      const legs = 6;
      return (
        <>
          <ellipse cx="200" cy="216" rx="152" ry="46" strokeWidth="2.5" />
          <ellipse cx="200" cy="216" rx="128" ry="38" strokeWidth="1" opacity="0.5" />
          <path d="M 48 216 L 48 244 A 152 46 0 0 0 352 244 L 352 216" strokeWidth="2.5" />
          {Array.from({ length: legs }, (_, i) => {
            const angle = (i / legs) * Math.PI * 2;
            const x = 200 + Math.cos(angle) * 118;
            const y = 252 + Math.sin(angle) * 30;
            return (
              <line key={i} x1={x} y1={y} x2={x} y2={y + 108} strokeWidth="2" opacity="0.75" />
            );
          })}
          {/* What sits on it. */}
          <motion.g
            stroke={GOLD}
            strokeWidth="2.5"
            initial={still ? false : { y: 0 }}
            animate={still ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M 200 108 C 178 130, 166 156, 166 178 C 166 200, 181 212, 200 212 C 219 212, 234 200, 234 178 C 234 156, 222 130, 200 108 Z" />
            <path d="M 168 152 C 150 144, 140 132, 138 118" strokeWidth="2" />
          </motion.g>
          <line x1="60" y1="410" x2="340" y2="410" strokeWidth="1" opacity="0.4" />
        </>
      );
    }

    /* Somebody's own model: a volume on a bed, drawn as its own wireframe. */
    case "mesh": {
      const top = [
        [200, 128],
        [312, 190],
        [200, 252],
        [88, 190],
      ];
      const drop = 118;
      return (
        <>
          <motion.g
            initial={still ? false : { rotate: -4 }}
            animate={still ? undefined : { rotate: [-4, 4, -4] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "200px 250px" }}
          >
            <polygon points={top.map(([x, y]) => `${x},${y}`).join(" ")} stroke={GOLD} strokeWidth="2" />
            <polygon
              points={top.map(([x, y]) => `${x},${y + drop}`).join(" ")}
              strokeWidth="1.5"
            />
            {top.map(([x, y], i) => (
              <line key={i} x1={x} y1={y} x2={x} y2={y + drop} strokeWidth="1.5" />
            ))}
            {/* The triangulation, which is what a print actually consumes. */}
            <line x1={top[0][0]} y1={top[0][1]} x2={top[2][0]} y2={top[2][1] + drop} strokeWidth="1" opacity="0.5" />
            <line x1={top[1][0]} y1={top[1][1]} x2={top[3][0]} y2={top[3][1] + drop} strokeWidth="1" opacity="0.5" />
            {top.map(([x, y], i) => (
              <circle key={`v${i}`} cx={x} cy={y} r="4" fill={GOLD} stroke="none" />
            ))}
          </motion.g>
          {/* The bed. */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={72 + i * 32}
              y1={420}
              x2={136 + i * 32}
              y2={388}
              strokeWidth="1"
              opacity="0.35"
            />
          ))}
          <line x1="56" y1="420" x2="344" y2="420" strokeWidth="2" opacity="0.6" />
        </>
      );
    }
  }
}

/** A Greek cross as one closed path: twelve corners, no fill rule needed. */
function greekCross(cx: number, cy: number, reach: number, arm: number) {
  const p = [
    [cx - arm, cy - reach],
    [cx + arm, cy - reach],
    [cx + arm, cy - arm],
    [cx + reach, cy - arm],
    [cx + reach, cy + arm],
    [cx + arm, cy + arm],
    [cx + arm, cy + reach],
    [cx - arm, cy + reach],
    [cx - arm, cy + arm],
    [cx - reach, cy + arm],
    [cx - reach, cy - arm],
    [cx - arm, cy - arm],
  ];
  return `M ${p.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;
}
