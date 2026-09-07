import type { Metadata } from "next";
import { Cta } from "@/components/sections/cta";
import { Mark } from "@/components/chrome/mark";
import { Plate } from "@/components/ui/plate";
import { MagicCard } from "@/components/ui/surfaces";
import { TextReveal } from "@/components/ui/text-reveal";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { locations, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Nisir is a multidisciplinary practice built between systems and craft — digital and dimensional work in Ontario, hands-on fashion education in Addis Ababa.",
};

const principles = [
  {
    n: "01",
    title: "Clarity first",
    body: "Explain the work without jargon or aesthetic noise. If it cannot be said plainly, it is not resolved yet — and no amount of finish will hide that.",
  },
  {
    n: "02",
    title: "Visible ownership",
    body: "Every service has a person accountable for its quality and its point of view. Not a pool of interchangeable resources, and never an anonymous handover.",
  },
  {
    n: "03",
    title: "Material proof",
    body: "Show real work, prototypes, studies and outcomes. A claim without evidence behind it does not belong on this site or in a proposal.",
  },
];

export default function StudioPage() {
  return (
    <main id="main">
      {/* Statement */}
      <section className="slab-ink relative overflow-hidden pb-20 pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="grid-rails" aria-hidden />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[14%] top-1/3 block w-[70vw] max-w-[820px] text-fg/[0.05]"
        >
          <Mark className="w-full animate-drift" />
        </span>

        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span>Studio</span>
              <span className="text-faint">Est. {site.founded}</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[12ch]"
            lines={[<>Built between</>, <>systems &amp; <span className="thin text-gold">craft</span>.</>]}
          />
          <Reveal immediate delay={0.5} className="mt-10">
            <p className="lede max-w-xl">
              One practice, two grounds: leading-edge digital and dimensional work in Canada, and
              the patient, human craft of an offline Fashion Academy in Ethiopia.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The name */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="marker tag-sm">
              <span>The name</span>
            </p>
            <div className="mt-8 w-40 text-accent">
              <Mark className="w-full" />
            </div>
          </Reveal>

          <div>
            <TextReveal
              className="d3 max-w-[18ch]"
              text="Nisir is the Amharic word for eagle. It is the whole brief: altitude, patience, and an eye that resolves detail from a long way out."
              accent={["eagle", "altitude"]}
            />
            <Reveal delay={0.1} className="mt-12">
              <p className="lede max-w-xl">
                The mark is drawn mid-stroke rather than perched — the practice is defined by what
                it is carrying, not by where it has landed. It appears once per page, large and
                quiet, and never as a decorative badge.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="slab-ink py-20 md:py-28">
        <div className="shell">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Reveal>
                <p className="marker tag-sm">
                  <span>Principles</span>
                </p>
              </Reveal>
              <Lines
                as="h2"
                className="d2 mt-8 max-w-[14ch]"
                lines={[<>What should</>, <>remain <span className="thin text-gold">true</span>.</>]}
              />
            </div>
            <Reveal delay={0.15}>
              <p className="max-w-xs text-[14px] leading-snug text-muted">
                Three commitments that survive every discipline, deadline and budget on this site.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid gap-3 md:grid-cols-3" stagger={0.1}>
            {principles.map((principle) => (
              <StaggerItem key={principle.n}>
                <MagicCard className="h-full bg-surface">
                  <div className="flex min-h-[340px] flex-col justify-between p-8">
                    <span className="tag-sm text-accent">{principle.n}</span>
                    <div>
                      <h3 className="d4">{principle.title}</h3>
                      <p className="mt-5 text-[15px] leading-relaxed text-muted">
                        {principle.body}
                      </p>
                    </div>
                  </div>
                </MagicCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Two grounds */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <p className="marker tag-sm">
              <span>Two grounds</span>
            </p>
          </Reveal>

          <div className="mt-14 grid gap-3 md:grid-cols-2">
            {locations.map((place, i) => (
              <Reveal key={place.id} delay={i * 0.1}>
                <article className="card h-full">
                  <Plate
                    kind={i === 0 ? "grid" : "weave"}
                    className="aspect-16/10 border-0 border-b"
                  />
                  <div className="p-8 md:p-10">
                    <p className="tag-sm text-accent">{place.role}</p>
                    <h3 className="d3 mt-5">{place.city}</h3>
                    <p className="tag mt-4 text-faint">{place.country}</p>
                    <p className="lede mt-6 max-w-md">
                      {i === 0
                        ? "Web and product systems, brand and motion, 3D modelling and print production — the side of the practice that ships to screens and to machines."
                        : "An offline school where apparel is taught by making it: pattern, material, construction and creative direction, in the room, with your hands."}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership — stated honestly rather than faked. */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="marker tag-sm">
              <span>Leadership</span>
            </p>
            <p className="d3 mt-6 max-w-[12ch]">
              People behind <span className="thin text-gold">the system</span>.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border border-dashed border-line-strong p-8 md:p-12">
              <p className="tag-sm text-faint">Founder / Studio director</p>
              <p className="d4 mt-6">Awaiting name and portrait</p>
              <p className="lede mt-5 max-w-xl">
                This block is reserved for the founder&rsquo;s story: why Nisir spans these
                disciplines, and how the Canada–Ethiopia footprint became one practice rather than
                two businesses. It is left empty on purpose — inventing a bio here would break the
                third principle on this page.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Cta
        eyebrow="Working together"
        lines={[<>Ideas meet</>, <><span className="thin text-gold">engineering</span>.</>]}
      />
    </main>
  );
}
