import { HomeHero } from "@/components/home/hero";
import { CapabilityBento } from "@/components/home/capability-bento";
import { MarqueeBand } from "@/components/home/marquee-band";
import { FlightPath } from "@/components/home/flight-path";
import { DualFootprint } from "@/components/home/dual-footprint";
import { ClosingCta } from "@/components/home/closing-cta";

export default function Home() {
  return (
    <main id="top">
      <HomeHero />
      <CapabilityBento />
      <MarqueeBand />
      <FlightPath />
      <DualFootprint />
      <ClosingCta />
    </main>
  );
}
