import type { Metadata } from "next";
import Link from "next/link";
import { capabilities, capabilityName } from "@/lib/capabilities";
import { SkyScene } from "@/components/sky";
import { MaskLines, Reveal } from "@/components/motion";
import { InquiryForm } from "@/components/inquiry-form";
import { SelectField } from "@/components/form-fields";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with Nisir Designs. Send a general inquiry, or go straight to the capability you need — no account required.",
};

const details = [
  { label: "Email", value: "hello@nisirdesigns.com", href: "mailto:hello@nisirdesigns.com" },
  { label: "Digital + 3D studio", value: "Ontario, Canada" },
  { label: "Fashion academy", value: "Addis Ababa, Ethiopia" },
];

export default function ContactPage() {
  return (
    <main id="top">
      <section className="relative isolate flex min-h-[62svh] flex-col justify-end overflow-hidden pb-14 pt-36">
        <SkyScene compact eagle={false} />
        <div className="shell relative">
          <Reveal immediate y={14}>
            <p className="eyebrow">General inquiry</p>
          </Reveal>
          <MaskLines
            immediate
            className="display display-xl mt-7 max-w-[12ch]"
            delay={0.12}
            lines={[<>Start with</>, <><span className="text-gradient-gold">the idea.</span></>]}
          />
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal y={14}>
              <h2 className="display display-md max-w-[12ch]">
                Tell us what you are <span className="text-gradient-gold">building.</span>
              </h2>
              <p className="mt-6 max-w-sm text-muted">
                If you already know the capability you need, use its specific form — the questions
                there are sharper. Otherwise send a general note and we will route it internally.
              </p>
            </Reveal>

            <Reveal delay={0.12} className="mt-12">
              <dl className="grid gap-px">
                {details.map((detail) => (
                  <div key={detail.label} className="border-t border-line py-5">
                    <dt className="label text-[10px] text-subtle">{detail.label}</dt>
                    <dd className="mt-2 text-[15px]">
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="transition-colors duration-300 hover:text-accent"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        detail.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.18} className="mt-12">
              <p className="label mb-4 text-[10px] text-subtle">Go direct</p>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((capability) => (
                  <Link
                    key={capability.slug}
                    href={`/capabilities/${capability.slug}#inquiry`}
                    className="rounded-full border border-line px-3.5 py-2 text-[12px] text-muted transition-colors duration-300 hover:border-accent hover:text-fg"
                  >
                    {capabilityName(capability)}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <InquiryForm
              submitLabel="Send inquiry ↗"
              note="No account required. This form is a prototype and does not send data yet."
            >
              <SelectField
                name="capability"
                label="Capability"
                options={["Not sure yet", ...capabilities.map((item) => capabilityName(item))]}
                className="sm:col-span-2"
              />
            </InquiryForm>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
