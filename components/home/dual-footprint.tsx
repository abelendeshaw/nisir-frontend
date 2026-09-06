import { EagleMark } from "@/components/brand";
import { MaskLines, Reveal, RevealGroup } from "@/components/motion";
import { SpotlightCard } from "@/components/spotlight-card";

const places = [
  {
    place: "Ontario, Canada",
    coords: "43.6532° N · 79.3832° W",
    title: "Digital + 3D studio",
    body: "Software, product design, modelling and physical prototyping form the technical production side of the practice.",
    disciplines: ["Web", "App", "Motion", "3D Modelling", "3D Printing"],
  },
  {
    place: "Addis Ababa, Ethiopia",
    coords: "9.0192° N · 38.7525° E",
    title: "Fashion academy",
    body: "An offline school extending the practice into hands-on apparel education, pattern craft and portfolio development.",
    disciplines: ["Apparel", "Pattern craft", "Creative direction"],
  },
];

export function DualFootprint() {
  return (
    <section className="py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Reveal y={14}>
              <p className="eyebrow">The dual footprint</p>
            </Reveal>
            <MaskLines
              as="h2"
              className="display display-lg mt-6 max-w-[16ch]"
              lines={[<>Technical precision.</>, <><span className="text-gradient-gold">Human craft.</span></>]}
            />
          </div>
          <Reveal delay={0.15} className="max-w-sm lg:pb-3">
            <p className="text-muted">
              Two hemispheres, one standard. What is engineered in Ontario and what is taught in
              Addis answer to the same brief.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="mt-14 grid gap-3 lg:grid-cols-2" stagger={0.12}>
          {places.map((place) => (
            <SpotlightCard key={place.place} className="card rounded-2xl">
              <div className="relative z-10 flex min-h-[440px] flex-col justify-between p-8 md:p-10">
                <div className="flex items-start justify-between gap-6">
                  <span className="label text-[10px] text-accent">{place.place}</span>
                  <span className="text-[11px] tracking-widest text-subtle">{place.coords}</span>
                </div>

                <div>
                  <h3 className="display text-4xl md:text-[52px]">{place.title}</h3>
                  <p className="mt-5 max-w-md text-muted">{place.body}</p>
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {place.disciplines.map((discipline) => (
                      <li
                        key={discipline}
                        className="rounded-full border border-line px-3 py-1.5 text-[11px] text-subtle"
                      >
                        {discipline}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <EagleMark className="pointer-events-none absolute -right-10 top-8 w-52 opacity-[0.06]" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent-bright) 8%, transparent))",
                }}
              />
            </SpotlightCard>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
