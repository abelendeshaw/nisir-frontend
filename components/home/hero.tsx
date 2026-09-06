import Link from "next/link";
import { SkyScene } from "@/components/sky";
import { MaskLines, Magnetic, Reveal } from "@/components/motion";

const stats = [
  { value: "07", label: "Capabilities" },
  { value: "02", label: "Continents" },
  { value: "01", label: "Studio" },
];

export function HomeHero() {
  return (
    <section className="relative isolate flex min-h-dvh flex-col justify-end overflow-hidden pb-10 pt-32 md:pb-14">
      <SkyScene />

      {/* Vertical instrument label, lifted from the brand mockups. */}
      <span
        aria-hidden="true"
        className="label absolute right-6 top-1/2 hidden -translate-y-1/2 text-[10px] leading-[2.4] text-subtle [writing-mode:vertical-rl] xl:block"
      >
        Bolder ideas — Higher tomorrow
      </span>

      <div className="shell relative">
        <Reveal immediate y={14}>
          <p className="eyebrow">Ideas meet engineering</p>
        </Reveal>

        {/* Three lines, stacked left, so the type never collides with the
            eagle riding the right-hand side of the sky. */}
        <MaskLines
          immediate
          className="display display-xl mt-7 max-w-[9ch]"
          delay={0.15}
          lines={[
            <>A brighter</>,
            <>tomorrow,</>,
            <span key="by-design" className="text-gradient-gold">
              by design.
            </span>,
          ]}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Reveal immediate delay={0.5} y={20}>
            <p className="max-w-xl text-lg leading-relaxed text-muted md:text-xl">
              One studio, seven capabilities. Nisir brings digital development, brand systems,
              motion, 3D production, and fashion education into a single disciplined practice —
              each craft given the space and ownership to stand on its own.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link href="/contact" className="btn btn-solid">
                  Let’s build ↗
                </Link>
              </Magnetic>
              <Magnetic>
                <a href="#capabilities" className="btn">
                  Explore capabilities ↓
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal immediate delay={0.65} y={20} className="lg:pb-2">
            <dl className="flex gap-8 sm:gap-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="label text-[9px] text-subtle">{stat.label}</dt>
                  <dd className="display mt-2 text-4xl text-accent md:text-5xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal immediate delay={0.8} y={12} className="mt-12">
          <div className="hairline" />
          <div className="label flex items-center justify-between pt-5 text-[10px] text-subtle">
            <span>Code · Brand · Engineer</span>
            <span className="hidden sm:inline">Ontario — Ethiopia</span>
            <span className="inline-flex items-center gap-2">
              Scroll
              <span className="inline-block animate-bounce text-accent">↓</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
