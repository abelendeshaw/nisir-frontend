import { MarkTravel } from "@/components/chrome/mark-travel";
import { Hero } from "@/components/sections/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Footprint } from "@/components/sections/footprint";
import { Cta } from "@/components/sections/cta";
import { SERVICES_LIVE } from "@/lib/flags";

export default function HomePage() {
  return (
    <main id="main">
      <MarkTravel>
        <Hero />
        <Manifesto />
      </MarkTravel>
      {/* Off with the rest of the section — see lib/flags.ts. The homepage
          reads Manifesto → Process without it, which still lands: what we
          believe, then how we work. */}
      {SERVICES_LIVE && <Services />}
      <Process />
      <Footprint />
      <Cta />
    </main>
  );
}
