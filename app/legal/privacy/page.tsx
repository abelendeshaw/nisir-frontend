import type { Metadata } from "next";
import Link from "next/link";
import { Clause, Definition, LegalPage, Points } from "@/components/legal/legal-page";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What ${site.legalName} collects, why, who else sees it, and how to get it back or deleted.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary={
        <>
          We collect what an order needs and very little else: a name, an email, a delivery
          address, and what you bought. There is no analytics on this site, no advertising
          pixels and no third-party trackers — so there is no profile of you here to sell, and
          we do not sell one.
        </>
      }
    >
      <Clause n={1} heading="Who is responsible for your information">
        <p>
          {site.legalName} is the organisation accountable for personal information collected
          through this site, under Canada&rsquo;s <em>Personal Information Protection and
          Electronic Documents Act</em> (PIPEDA). Privacy questions and requests go to{" "}
          <a href={`mailto:${legal.contactEmail}`} className="ul text-fg hover:text-accent">
            {legal.contactEmail}
          </a>
          , which reaches the person who handles them.
        </p>
      </Clause>

      <Clause n={2} heading="What we collect">
        <div className="flex flex-col gap-4">
          <Definition term="Account details">
            Your name, email address and a password. The password is never stored as you typed
            it — it is hashed by our order service, and nobody here can read it back.
          </Definition>
          <Definition term="Order details">
            Delivery address, phone number, what you ordered and how it was configured, the
            total, and the status of the print.
          </Definition>
          <Definition term="Uploaded models">
            Files you submit for custom printing, and the measurements taken from them. Held
            while the order is live and for a reasonable period after, then deleted.
          </Definition>
          <Definition term="Correspondence">
            Emails and enquiry forms you send us, and our replies.
          </Definition>
          <Definition term="Technical information">
            Our host records ordinary server logs, including IP addresses, for security and
            diagnostics. One essential cookie keeps you signed in — the{" "}
            <Link href="/legal/cookies" className="ul text-fg hover:text-accent">
              Cookie Policy
            </Link>{" "}
            covers it in full.
          </Definition>
        </div>
        <p>
          We do not collect card numbers. Card payment is not live on this site; details entered
          into the checkout form are checked in your browser and are not transmitted to us or
          stored anywhere. When card payment does go live it will be handled by a payment
          processor, and this policy will be updated to name them before that happens.
        </p>
        <p>
          We ask for no information about your health, beliefs, ethnicity or anything else in a
          special category, and you should not send us any.
        </p>
      </Clause>

      <Clause n={3} heading="Why we have it">
        <Points
          items={[
            "To take, print, deliver and support your order — the reason most of it exists at all.",
            "To operate your account, and to let you sign in and see your own order history.",
            "To email you about an order: confirmation, dispatch, a change in print status, a reply to a question.",
            "To keep records we are required to keep, including for tax.",
            "To protect the site and its customers against fraud and abuse.",
          ]}
        />
        <p>
          We do not send marketing email. If that ever changes we will ask you to opt in first,
          and every message will carry a way out.
        </p>
      </Clause>

      <Clause n={4} heading="Who else sees it">
        <p>
          Only the suppliers it takes to run the service, each given the minimum needed to do
          its job, and none of them permitted to use it for their own purposes:
        </p>
        <div className="flex flex-col gap-4">
          <Definition term="Hosting">
            The site and its order service run on managed hosting. Your data sits on those
            servers.
          </Definition>
          <Definition term="Email delivery">
            Mailtrap sends our transactional email. It processes the recipient address and the
            message contents in order to deliver them.
          </Definition>
          <Definition term="Delivery carriers">
            The courier carrying your parcel gets the name, address and phone number needed to
            deliver it, and customs paperwork where the border requires it.
          </Definition>
        </div>
        <p>
          We may also disclose information where the law requires it, to enforce our{" "}
          <Link href="/legal/terms" className="ul text-fg hover:text-accent">
            Terms of Service
          </Link>
          , or to a buyer of the business — who would remain bound by this policy. We do not
          sell your personal information, and we never have.
        </p>
      </Clause>

      <Clause n={5} heading="Where it goes">
        <p>
          We operate from Canada and Ethiopia, and our suppliers may process data in other
          countries. Information held or handled in another country is subject to that
          country&rsquo;s laws, including lawful access by its courts and authorities. We use
          suppliers bound by contract to protect it to a comparable standard.
        </p>
      </Clause>

      <Clause n={6} heading="How long we keep it">
        <Points
          items={[
            "Order records: seven years, which is what tax and accounting rules require of us.",
            "Account details: while the account is open, and for a short period after you close it in case of a dispute.",
            "Uploaded model files: while the order is live and for a reasonable period after delivery, then deleted.",
            "Correspondence: up to two years, so we can pick up a thread you started.",
            "Server logs: a short rolling window, for security and diagnostics.",
          ]}
        />
      </Clause>

      <Clause n={7} heading="Your rights">
        <p>You can ask us to:</p>
        <Points
          items={[
            "tell you what we hold about you, and give you a copy;",
            "correct anything inaccurate or out of date;",
            "delete what we hold, where we are not required to keep it — order records we must retain for tax are the usual exception;",
            "stop a particular use, or withdraw a consent you gave. Withdrawing consent needed to fulfil an order may mean we cannot complete it.",
          ]}
        />
        <p>
          Write to{" "}
          <a href={`mailto:${legal.contactEmail}`} className="ul text-fg hover:text-accent">
            {legal.contactEmail}
          </a>
          . We answer within 30 days, and we may need to confirm who you are first so we are not
          handing your information to somebody else.
        </p>
        <p>
          If our answer does not satisfy you, you can complain to the{" "}
          <a
            href={legal.regulator.href}
            target="_blank"
            rel="noreferrer noopener"
            className="ul text-fg hover:text-accent"
          >
            {legal.regulator.name}
          </a>
          .
        </p>
      </Clause>

      <Clause n={8} heading="Security">
        <p>
          Traffic to this site is encrypted in transit. Passwords are hashed, never stored in
          readable form. Your session is held in a cookie your browser cannot read from
          JavaScript, and signing out revokes it on the server rather than merely forgetting it
          here.
        </p>
        <p>
          No service is perfectly secure, and we will not pretend otherwise. If a breach affects
          you and creates a real risk of significant harm, we will notify you and the Privacy
          Commissioner as PIPEDA requires.
        </p>
      </Clause>

      <Clause n={9} heading="Children">
        <p>
          This site is not directed at children, and we do not knowingly collect information
          from anyone under 16. If you believe a child has given us information, write to us and
          we will delete it.
        </p>
      </Clause>

      <Clause n={10} heading="Changes to this policy">
        <p>
          When this policy changes, the date at the top of the page changes with it. Where a
          change materially affects how we use information we already hold, we will say so on
          this page before it takes effect.
        </p>
      </Clause>
    </LegalPage>
  );
}
