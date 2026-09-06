import Link from "next/link";
import { EagleMark } from "@/components/brand";
import { Magnetic, MaskLines, Reveal } from "@/components/motion";

export function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden py-32 md:py-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 120%, var(--glow) 0%, transparent 68%), linear-gradient(180deg, var(--bg), var(--bg-deep))",
        }}
      />
      <EagleMark className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70vw,640px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" />

      <div className="shell relative text-center">
        <Reveal y={14}>
          <p className="eyebrow justify-center">Start the conversation</p>
        </Reveal>
        <MaskLines
          as="h2"
          className="display display-lg mx-auto mt-7 max-w-[14ch]"
          lineClassName="text-center"
          lines={[<>Enter through the</>, <><span className="text-gradient-gold">capability</span> you need.</>]}
        />
        <Reveal delay={0.25} className="mx-auto mt-8 max-w-xl">
          <p className="text-muted">
            No account, no gatekeeping. Pick the practice that fits, or send one general note and
            we will route it internally.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <Link href="/contact" className="btn btn-solid">
                General inquiry ↗
              </Link>
            </Magnetic>
            <Magnetic>
              <a href="#capabilities" className="btn">
                Back to capabilities ↑
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
