import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry";
import { SelectField } from "@/components/forms/fields";
import { Lines, Reveal } from "@/components/ui/reveal";
import { services, serviceName } from "@/lib/services";
import { locations, site, social } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with Nisir. Send a general inquiry, or go straight to the service you need — no account required.",
};

export default function ContactPage() {
  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-14 pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="grid-rails" aria-hidden />
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span>Contact</span>
              <span className="text-faint">General inquiry</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[11ch]"
            lines={[
              <Fragment key="a">Start with</Fragment>,
              <Fragment key="b">
                the <span className="thin text-gold">idea</span>.
              </Fragment>,
            ]}
          />
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="shell grid gap-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-24">
          {/* Where it lands */}
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <Reveal>
              <p className="lede max-w-sm">
                If you already know the service you need, use its own form — the questions there
                are sharper. Otherwise send a general note and we will route it internally.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <dl className="flex flex-col">
                <div className="border-t border-line py-5">
                  <dt className="tag-sm text-faint">Email</dt>
                  <dd className="mt-2.5">
                    <a
                      href={`mailto:${site.email}`}
                      className="ul text-[16px] transition-colors duration-300 hover:text-accent"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                {locations.map((place) => (
                  <div key={place.id} className="border-t border-line py-5">
                    <dt className="tag-sm text-faint">{place.role}</dt>
                    <dd className="mt-2.5 text-[16px]">
                      {place.city}, {place.country}
                    </dd>
                  </div>
                ))}
                <div className="border-y border-line py-5">
                  <dt className="tag-sm text-faint">Elsewhere</dt>
                  <dd className="mt-3 flex flex-wrap gap-5">
                    {social.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="ul text-[15px] text-muted transition-colors hover:text-fg"
                      >
                        {item.label}
                      </a>
                    ))}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.16} className="mt-12">
              <p className="tag-sm mb-4 text-faint">Go direct</p>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}#inquiry`}
                    className="tag-sm rounded-full border border-line px-3.5 py-2.5 text-muted transition-colors duration-300 hover:border-accent hover:text-fg"
                  >
                    {serviceName(service)}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <InquiryForm
              submitLabel="Send inquiry"
              note="No account required. This form is a prototype and does not transmit yet."
            >
              <SelectField
                name="service"
                label="Service"
                options={["Not sure yet", ...services.map((item) => serviceName(item))]}
                className="sm:col-span-2"
              />
            </InquiryForm>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
