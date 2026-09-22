import type { Metadata } from "next";
import Link from "next/link";
import { Clause, LegalPage, Points } from "@/components/legal/legal-page";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms on which ${site.legalName} sells printed objects, digital files and design work.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      summary={
        <>
          These are the terms you agree to when you buy something from {site.legalName} or make
          an account here. The short version: pieces are printed to order, so there is a narrow
          window to change your mind; you keep the rights to models you upload and we keep the
          rights to ours; and nothing here takes away a right Ontario consumer law gives you.
        </>
      }
    >
      <Clause n={1} heading="Who you are contracting with">
        <p>
          This site is operated by {site.legalName} (&ldquo;Nisir&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;), a design practice working from Ontario, Canada and Addis Ababa,
          Ethiopia. Reaching us in writing means{" "}
          <a href={`mailto:${legal.contactEmail}`} className="ul text-fg hover:text-accent">
            {legal.contactEmail}
          </a>
          .
        </p>
        <p>
          By using this site, creating an account or placing an order you accept these terms. If
          you do not accept them, do not place an order.
        </p>
      </Clause>

      <Clause n={2} heading="Accounts">
        <Points
          items={[
            "Checkout requires an account. That is so an order can be traced back to somebody afterwards — by you, when you want to know where a piece is, and by us, when you write to ask.",
            "Give us details that are accurate and keep them that way. An order we cannot deliver or ask you about because the address or email is wrong is not something we can refund.",
            "You are responsible for what happens under your account, and for keeping your password to yourself. Tell us promptly if you think someone else has it.",
            "You can ask us to close your account at any time. We may suspend or close an account that is being used to break these terms, or to defraud us or somebody else.",
          ]}
        />
      </Clause>

      <Clause n={3} heading="Orders, and when a sale actually happens">
        <p>
          Placing an order is an offer to buy, not a completed sale. The contract forms when we
          confirm the order by email. Until then we may decline it — because a piece cannot be
          printed as specified, because stock or capacity has run out, because a price was listed
          in error, or because we suspect fraud.
        </p>
        <p>
          Where we decline an order you have already paid for, you get a full refund and nothing
          else is owed either way.
        </p>
      </Clause>

      <Clause n={4} heading="Prices, taxes and duties">
        <Points
          items={[
            <>
              Prices are shown in Canadian dollars (CAD) and exclude tax and delivery until
              checkout works them out.
            </>,
            "Tax is applied by destination: HST for Canadian orders, VAT for Ethiopian orders, and no tax collected by us on orders elsewhere.",
            "For deliveries outside Canada and Ethiopia, import duties, customs charges and local taxes are yours to pay, and are not included in anything you pay us. Customs can also hold a parcel for reasons neither of us controls.",
            "We may change prices at any time, but not for an order we have already confirmed.",
          ]}
        />
      </Clause>

      <Clause n={5} heading="Payment">
        <p>
          Payment is taken by the method offered at checkout, and an order is not put into the
          print queue until payment has cleared.
        </p>
        <p className="border-l-2 border-gold pl-5 text-fg">
          Card payment on this site is not live yet. Until it is, card details entered into the
          checkout form are validated in your browser and are not transmitted to us, stored, or
          charged. If you have been asked to pay, it was arranged with you directly — by
          invoice, transfer or in person — and not through this form.
        </p>
      </Clause>

      <Clause n={6} heading="Made to order, and changing your mind">
        <p>
          Almost everything here is printed after you order it rather than taken off a shelf. A
          piece begins as filament and machine time that cannot be recovered once it has been
          spent, which is what the following is about rather than any reluctance to be helpful.
        </p>
        <Points
          items={[
            "You may cancel or change an order at no cost while it is still queued. Write to us as soon as you can.",
            "Once a piece has started printing we may not be able to cancel it, and where we cannot, the order stands.",
            "Custom and personalised pieces — anything printed from a model you supplied, or altered to your specification — cannot be returned because you have changed your mind. This does not affect your rights where the piece is faulty.",
            "Lead times quoted on a product page are estimates from the print queue, not guarantees, and they run from the day payment clears.",
          ]}
        />
      </Clause>

      <Clause n={7} heading="Faults, damage and returns">
        <p>
          If a piece arrives damaged, or is not what you ordered, tell us within 14 days of
          delivery and send a photograph. We will reprint it or refund it, whichever you prefer,
          and we pay the return postage where a return is needed.
        </p>
        <p>
          3D printing leaves marks. Visible layer lines, faint seams where the nozzle changed
          direction, minor colour variation between batches and small differences from the
          rendered images are characteristics of the process, not defects — the{" "}
          <Link href="/store" className="ul text-fg hover:text-accent">
            product pages
          </Link>{" "}
          say which finish smooths which of these. Dimensions are as modelled and may vary by
          a fraction of a millimetre.
        </p>
        <p>
          Nothing in this section limits the statutory rights you have as a consumer in Ontario,
          including under the <em>Consumer Protection Act, 2002</em>.
        </p>
      </Clause>

      <Clause n={8} heading="Models you upload">
        <p>
          The custom printing service takes a model file from you and prices it from its
          geometry. When you upload one:
        </p>
        <Points
          items={[
            "You keep every right you already had in it. We claim no ownership of your model.",
            "You confirm you are allowed to have it printed — that you made it, licensed it, or otherwise hold the rights, and that printing it infringes nobody's copyright, trade mark, design right or patent.",
            "You grant us the limited licence we need to do the job: to store the file, measure it, slice it, print it, and show it back to you.",
            "We may refuse to print anything — including, and without needing to explain further, functional weapons or their components, anything that appears counterfeit, and anything illegal in Ontario or the destination country.",
            "Uploaded files are held while the order is live and for a reasonable period after it, then deleted. Ask us and we will delete yours sooner.",
          ]}
        />
        <p>
          You are responsible for what you upload, and you agree to cover us for third-party
          claims arising from printing it — see clause 11.
        </p>
      </Clause>

      <Clause n={9} heading="Our designs, and what you may do with them">
        <p>
          The designs in the store, this site, its text, photographs and code remain ours or our
          licensors&rsquo;.
        </p>
        <Points
          items={[
            "Buying a printed piece buys you the piece. It is yours to keep, give away or resell as an object.",
            "It does not buy the design. Reproducing a piece — casting it, scanning it, remodelling it, or printing more of it — for sale or distribution needs our written permission.",
            "Where you buy a digital file, you get a personal, non-transferable licence to print it for yourself. You may not redistribute, resell or publish the file, and refunds are not available once it has been downloaded.",
            "Brand names, marks and the Nisir name are not licensed to you by anything on this page.",
          ]}
        />
      </Clause>

      <Clause n={10} heading="Using the site">
        <p>Do not:</p>
        <Points
          items={[
            "try to break, overload or get around the security of this site or the services behind it;",
            "scrape it at a rate that degrades it for anyone else, or resell its content;",
            "upload anything containing malware, or submit somebody else's personal information as your own;",
            "use another person's account or payment details.",
          ]}
        />
      </Clause>

      <Clause n={11} heading="Liability">
        <p>
          The site is provided as it is. We do not promise it will always be available, or free
          of errors, and we give no warranties beyond those the law requires us to give and does
          not let us exclude.
        </p>
        <p>
          Where we are liable, our total liability for any order is limited to what you paid for
          it. We are not liable for indirect or consequential loss — lost profit, lost
          opportunity, loss of data, or the cost of a substitute somewhere else.
        </p>
        <p>
          None of this limits liability for death or personal injury caused by our negligence,
          for fraud, or for anything else that cannot lawfully be limited. As a consumer, your
          statutory rights stand whatever this clause says.
        </p>
        <p>
          You agree to indemnify us against claims, losses and reasonable legal costs arising
          from a model you uploaded, from content you submitted, or from your breach of these
          terms.
        </p>
      </Clause>

      <Clause n={12} heading="Governing law">
        <p>
          These terms are governed by the laws of {legal.jurisdiction}, and the courts of Ontario
          have jurisdiction over any dispute. If you are a consumer resident elsewhere, this does
          not deprive you of the protection of your own local consumer law.
        </p>
      </Clause>

      <Clause n={13} heading="Changes to these terms">
        <p>
          We may revise these terms. The version in force for your order is the one published
          when you placed it, and the date at the top of this page tells you when the wording
          last changed. Material changes will be announced on this page before they take effect.
        </p>
      </Clause>
    </LegalPage>
  );
}
