import Link from "next/link";
import { nextQuery } from "@/lib/auth/next-path";

/**
 * "Continue with Google", and the rule that separates it from the email form
 * below it.
 *
 * A plain anchor, not `next/link`: the destination is a route handler that
 * sends the browser off-site to Google, which is a full navigation — the
 * client router would try to fetch it as a page. `next` rides along so a
 * visitor the checkout gate sent here lands back at the till.
 *
 * `withTerms` is for the signup page. The email form there makes a visitor
 * tick the terms before an account exists; Google skips that form, so the
 * agreement is stated beside the button instead.
 *
 * The mark is Google's own four-colour "G", unaltered, as their sign-in
 * branding requires.
 */
export function GoogleButton({ next, withTerms = false }: { next?: string | null; withTerms?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <a
          href={`/auth/google${nextQuery(next)}`}
          className="flex h-14 items-center justify-center gap-3 border-2 border-line-strong text-[14px] font-semibold text-fg transition-colors duration-300 hover:border-fg"
        >
          <svg aria-hidden viewBox="0 0 48 48" className="size-5 shrink-0">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          Continue with Google
        </a>

        {withTerms && (
          <p className="text-[12px] leading-snug text-faint">
            By continuing with Google you agree to the{" "}
            <Link href="/legal/terms" className="ul text-muted hover:text-accent">
              terms
            </Link>{" "}
            and the{" "}
            <Link href="/legal/privacy" className="ul text-muted hover:text-accent">
              privacy policy
            </Link>
            .
          </p>
        )}
      </div>

      <p className="tag-sm flex items-center gap-4 text-faint" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </p>
    </div>
  );
}
