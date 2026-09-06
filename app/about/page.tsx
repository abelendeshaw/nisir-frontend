import type { Metadata } from "next";
import Link from "next/link";
import { EagleMark } from "@/components/brand";
import { SkyScene } from "@/components/sky";
import { Magnetic, MaskLines, Reveal, RevealGroup } from "@/components/motion";
import { ScrollHighlight } from "@/components/scroll-highlight";
import { SpotlightCard } from "@/components/spotlight-card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nisir Designs is a multidisciplinary practice built between systems and craft — digital and 3D work in Ontario, hands-on fashion education in Ethiopia.",
};

const principles = [
  {
    n: "01",
    title: "Intellectual clarity",
    body: "Explain the work without hiding behind jargon or aesthetic noise. If it cannot be said plainly, it is not resolved yet.",
  },
  {
    n: "02",
    title: "Visible ownership",
    body: "Every capability has a person accountable for its quality and point of view — not a pool of anonymous resources.",
  },
  {
    n: "03",
    title: "Material proof",
    body: "Show real work, prototypes, studies and outcomes. Claims without evidence do not belong on this site.",
  },
];

export default function AboutPage() {
  return (
    <main id="top">
      <section className="relative isolate flex min-h-[80svh] flex-col justify-end overflow-hidden pb-14 pt-36">
        <SkyScene compact />
        <div className="shell relative">
          <Reveal immediate y={14}>
            <p className="eyebrow">About the studio</p>
          </Reveal>
          <MaskLines
            immediate
            className="display display-xl mt-7 max-w-[13ch]"
            delay={0.12}
            lines={[<>Built between</>, <><span className="text-gradient-gold">systems &amp; craft.</span></>]}
          />
          <Reveal immediate delay={0.45} y={20} className="mt-9">
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              A multidisciplinary home: leading-edge digital and 3D work in Canada, alongside the
              practical, human craft of an offline Fashion Academy in Ethiopia.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Statement that lights up as you read it. */}
      <section className="py-28 md:py-40">
        <div className="shell grid gap-12 lg:grid-cols-[0.5fr_1.5fr] lg:gap-20">
          <Reveal y={14}>
            <p className="eyebrow">Our point of view</p>
          </Reveal>
          <div>
            <ScrollHighlight
              className="display-md max-w-[22ch] leading-[1.08]"
              text="The most influential work is not louder. It is clearer, more deliberate, and better resolved."
              accentWords={["clearer", "deliberate", "resolved"]}
            />
            <Reveal delay={0.1} className="mt-12">
              <p className="max-w-xl text-lg text-muted">
                This studio is organised less like an agency menu and more like a set of
                accountable practices. Each capability carries its own craft, owner, proof and
                path to inquiry — and answers to one shared standard.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-bg-deep py-24 md:py-32">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Reveal y={14}>
                <p className="eyebrow">Studio principles</p>
              </Reveal>
              <MaskLines
                as="h2"
                className="display display-lg mt-6 max-w-[16ch]"
                lines={[<>What should</>, <><span className="text-gradient-gold">remain true.</span></>]}
              />
            </div>
          </div>

          <RevealGroup className="mt-14 grid gap-3 md:grid-cols-3" stagger={0.1}>
            {principles.map((principle) => (
              <SpotlightCard key={principle.n} className="card rounded-2xl">
                <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-8">
                  <span className="label text-[10px] text-accent">{principle.n}</span>
                  <div>
                    <h3 className="display text-3xl">{principle.title}</h3>
                    <p className="mt-4 text-muted">{principle.body}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="shell">
          <Reveal y={14}>
            <p className="eyebrow">Leadership</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display display-md mt-6 max-w-[16ch]">
              Put real people behind <span className="text-gradient-gold">the system.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            <SpotlightCard className="card rounded-3xl">
              <div className="relative z-10 grid gap-10 p-8 md:grid-cols-[280px_1fr] md:p-12">
                <div className="relative grid aspect-4/5 place-items-center overflow-hidden rounded-2xl bg-navy">
                  <div className="absolute size-[62%] rounded-full border border-gold/50" />
                  <span className="display text-8xl text-ivory/90">?</span>
                  <EagleMark
                    alwaysGold
                    className="pointer-events-none absolute -bottom-6 -right-6 w-32 opacity-10"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="label text-[10px] text-accent">Founder / Studio director</p>
                  <h3 className="display mt-4 text-4xl md:text-5xl">Add founder name</h3>
                  <p className="mt-6 max-w-xl text-muted">
                    This block is for the founder&rsquo;s story: why Nisir spans these disciplines,
                    and how the Canada–Ethiopia footprint connects into one practice.
                  </p>
                  <span className="label mt-8 inline-flex w-fit rounded-full border border-dashed border-line-strong px-4 py-2 text-[9px] text-subtle">
                    No founder identity was supplied
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      <section className="pb-28 md:pb-40">
        <div className="shell">
          <Reveal>
            <div className="hairline" />
            <div className="flex flex-col gap-6 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="display display-md max-w-[16ch]">
                Ideas meet <span className="text-gradient-gold">engineering.</span>
              </p>
              <Magnetic>
                <Link href="/contact" className="btn btn-solid">
                  Start a project ↗
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
