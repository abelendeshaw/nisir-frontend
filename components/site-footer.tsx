import Link from "next/link";
import { capabilities, capabilityName } from "@/lib/capabilities";
import { BrandLockup, EagleMark } from "@/components/brand";
import { Reveal } from "@/components/motion";

/**
 * The footer stays midnight navy in both themes — it's the brand's anchor,
 * the same way the stationery in the identity system is always navy.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-navy-deep text-ivory">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(70% 50% at 12% 0%, rgb(212 175 55 / .12) 0%, transparent 68%), radial-gradient(50% 60% at 95% 100%, rgb(212 175 55 / .08) 0%, transparent 70%)",
        }}
      />
      <EagleMark
        alwaysGold
        className="pointer-events-none absolute -right-10 -top-16 w-[min(46vw,520px)] opacity-[0.05]"
      />

      <div className="shell relative">
        <div className="grid gap-10 border-b border-ivory/10 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-28">
          <Reveal>
            <p className="eyebrow !text-gold">A brighter tomorrow</p>
            <h2 className="display display-lg mt-6 max-w-[16ch]">
              Ideas meet <span className="text-gradient-gold">engineering.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:justify-self-end">
            <p className="max-w-sm text-ivory/60">
              Tell us what you are building. Every capability has its own path in — or send one
              note and we will route it.
            </p>
            <Link
              href="/contact"
              className="btn btn-ondark mt-8 border-ivory/25 text-ivory hover:text-navy"
            >
              Start a project ↗
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <BrandLockup onDark />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/55">
              A multidisciplinary creative practice spanning digital products, brand systems, 3D
              engineering, and fashion education — across Ontario and Ethiopia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterColumn title="Capabilities">
              {capabilities.map((capability) => (
                <FooterLink key={capability.slug} href={`/capabilities/${capability.slug}`}>
                  {capabilityName(capability)}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title="Studio">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/store">3D Store</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterColumn>
            <FooterColumn title="Connect">
              <FooterLink href="#">Instagram</FooterLink>
              <FooterLink href="#">LinkedIn</FooterLink>
              <FooterLink href="mailto:hello@nisirdesigns.com">Email</FooterLink>
            </FooterColumn>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-ivory/10 py-8 text-[11px] uppercase tracking-[0.22em] text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Nisir Designs</span>
          <span className="text-gold/70">Code · Brand · Engineer</span>
          <a href="#top" className="transition-colors hover:text-ivory">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label mb-5 text-[10px] text-ivory/40">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("mailto:") || href === "#";
  const className =
    "group inline-flex items-center gap-1.5 text-[13px] text-ivory/70 transition-colors duration-300 hover:text-gold";
  const content = (
    <>
      <span className="h-px w-0 bg-gold transition-all duration-400 group-hover:w-3" />
      {children}
    </>
  );

  return (
    <li>
      {external ? (
        <a href={href} className={className}>
          {content}
        </a>
      ) : (
        <Link href={href} className={className}>
          {content}
        </Link>
      )}
    </li>
  );
}
