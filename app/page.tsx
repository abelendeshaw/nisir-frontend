import { MarkTravel } from "@/components/chrome/mark-travel";
import { Hero } from "@/components/sections/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Footprint } from "@/components/sections/footprint";
import { Cta } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <main id="main">
      <MarkTravel>
        <Hero />
        <Manifesto />
      </MarkTravel>
      <Services />
      <Process />
      <Footprint />
      <Cta />
    </main>
  );
}
