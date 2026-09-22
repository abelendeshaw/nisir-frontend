import type { Metadata } from "next";
import Link from "next/link";
import { Clause, Definition, LegalPage, Points } from "@/components/legal/legal-page";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookies",
  description: `The one cookie ${site.legalName} sets, what it holds, and what this site deliberately does not track.`,
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      summary={
        <>
          This site sets one cookie, and only once you sign in. There is no analytics, no
          advertising, no pixels and no third-party trackers of any kind — which is why you are
          not being asked to accept or reject anything. There is nothing here to reject.
        </>
      }
    >
      <Clause n={1} heading="The cookie we set">
        <div className="flex flex-col gap-4">
          <Definition term="nisir_session — strictly necessary">
            Set when you sign in, and only then. It holds a signed token identifying your
            account so that each page you load knows it is you. It expires after seven days, or
            immediately when you sign out. It is <em>httpOnly</em>, meaning no JavaScript on
            this page — ours or anyone else&rsquo;s — can read it, and it is marked{" "}
            <em>secure</em> in production so it is only ever sent over an encrypted connection.
          </Definition>
        </div>
        <p>
          This is the whole list. Under Canadian and EU rules a cookie that is strictly
          necessary to provide a service the user asked for does not require consent, and a
          signed-in session is the textbook example: refusing it would mean refusing to let you
          sign in.
        </p>
      </Clause>

      <Clause n={2} heading="Things kept in your browser that are not cookies">
        <p>
          Your cart and your saved objects are held in your browser&rsquo;s local storage, not in
          a cookie. The difference matters in practice: local storage is never attached to a
          request, so this data is never transmitted to us as you browse, and we cannot read it
          from the server.
        </p>
        <Points
          items={[
            "Your cart — what you have added, and the options you chose.",
            "Your saved objects — the wishlist.",
            "Whether you have dismissed the notice about this page.",
          ]}
        />
        <p>
          It stays on the device you created it on. Clearing your browser data clears it, and
          nothing is recoverable afterwards — which is one of the reasons an account is worth
          having.
        </p>
      </Clause>

      <Clause n={3} heading="What this site does not do">
        <Points
          items={[
            "No analytics. We do not run Google Analytics or any equivalent, so there is no record here of which pages you visited.",
            "No advertising or remarketing pixels, from Meta or anyone else.",
            "No third-party scripts loaded to observe you. Fonts are served from this site rather than fetched from another company's server.",
            "No cross-site tracking, and nothing sold or shared with data brokers.",
          ]}
        />
        <p>
          If we ever add analytics, this page will change before it goes live and you will be
          asked to consent first — because at that point there would finally be something worth
          consenting to.
        </p>
      </Clause>

      <Clause n={4} heading="Controlling cookies yourself">
        <p>
          Every browser can block or delete cookies, usually under Settings → Privacy. Blocking
          ours has one consequence and no others: you will not be able to stay signed in, so
          your account, your order history and checkout will not work. Browsing the store and
          filling a cart will still be fine.
        </p>
        <p>
          Signing out from{" "}
          <Link href="/account" className="ul text-fg hover:text-accent">
            your account
          </Link>{" "}
          removes the cookie and revokes the session on our side at the same time.
        </p>
      </Clause>

      <Clause n={5} heading="Questions">
        <p>
          Anything unclear here, or anything you think is inaccurate, goes to{" "}
          <a href={`mailto:${legal.contactEmail}`} className="ul text-fg hover:text-accent">
            {legal.contactEmail}
          </a>
          . The{" "}
          <Link href="/legal/privacy" className="ul text-fg hover:text-accent">
            Privacy Policy
          </Link>{" "}
          covers everything we hold that is not a cookie.
        </p>
      </Clause>
    </LegalPage>
  );
}
