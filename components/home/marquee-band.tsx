import { Marquee } from "@/components/motion";

const words = ["Bold", "Precise", "Premium", "Visionary", "Engineered"];

export function MarqueeBand() {
  return (
    <section aria-hidden="true" className="relative border-y border-line py-8 md:py-10">
      <Marquee duration={38}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="flex items-center">
            <span className="display px-6 text-4xl text-fg/85 md:px-10 md:text-6xl">{word}</span>
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </Marquee>

      {/* Soft edges so the band bleeds out instead of cutting off. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40"
        style={{ background: "linear-gradient(90deg, var(--bg), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40"
        style={{ background: "linear-gradient(270deg, var(--bg), transparent)" }}
      />
    </section>
  );
}
