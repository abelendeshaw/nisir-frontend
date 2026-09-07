"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Mark } from "@/components/chrome/mark";
import { Marquee } from "@/components/ui/marquee";
import { Lines, Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { services, serviceName } from "@/lib/services";

/**
 * The first screen is a single ink slab with three lines of display type
 * running to the page margin.
 *
 * On scroll the lines shear past each other — the top line drags right, the
 * middle drags left, the bottom right again. It is one transform per line, but
 * it turns a static headline into something that is clearly reacting to you,
 * which is the whole point of the entrance.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const l1 = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const l2 = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const l3 = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const fade = useTransform(scrollYProgress, [0.35, 1], [1, 0]);
  const markX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section
      ref={ref}
      className="slab-ink relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      {/* The mark, oversized and cropped by the right edge. */}
      <motion.div
        aria-hidden
        style={{ x: markX }}
        className="pointer-events-none absolute -right-[22%] top-1/2 w-[110vw] -translate-y-1/2 md:-right-[10%] md:w-[70vw]"
      >
        <Mark className="w-full text-gold/[0.14]" />
      </motion.div>

      <div className="bleed relative flex flex-1 flex-col justify-between pb-6 pt-[calc(var(--header-h)+clamp(20px,4vh,56px))]">
        <Reveal immediate y={8}>
          <p className="marker tag-sm">
            <span>Multidisciplinary design practice</span>
            <span className="hidden text-faint sm:inline">Ontario / Addis Ababa</span>
          </p>
        </Reveal>

        {/* Three lines, three speeds. */}
        <motion.h1 style={{ opacity: fade }} className="d0 my-auto py-[2vh]">
          <motion.span style={{ x: l1 }} className="block">
            <Lines immediate delay={0.1} lines={[<>A brighter</>]} />
          </motion.span>
          <motion.span style={{ x: l2 }} className="block text-gold">
            <Lines immediate delay={0.18} lines={[<>Tomorrow,</>]} />
          </motion.span>
          <motion.span style={{ x: l3 }} className="block">
            <Lines immediate delay={0.26} lines={[<>By design.</>]} />
          </motion.span>
        </motion.h1>

        <Reveal immediate delay={0.55} y={16}>
          <div className="flex flex-col gap-8 border-t-2 border-line pt-6 md:flex-row md:items-end md:justify-between">
            <p className="lede max-w-md">
              One studio across two continents, building the digital, the printed and the
              physical — and teaching the craft behind them.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic strength={0.25}>
                <Link href="/services" className="btn btn-solid">
                  Seven services
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link href="/contact" className="btn">
                  Start a project
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Gold rail: the practice, read out. */}
      <div className="slab-gold relative flex items-center py-3">
        <Marquee duration={38} fade={false}>
          {services.map((service) => (
            <span key={service.slug} className="flex items-center">
              <span className="tag px-6">{serviceName(service)}</span>
              <span className="text-[8px]">●</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
