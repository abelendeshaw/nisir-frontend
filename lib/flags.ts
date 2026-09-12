/**
 * Sections of the site that can be switched off without deleting them.
 *
 * `SERVICES_LIVE` is false because the services work is not ready to be shown.
 * Nothing under `app/services/` has been removed — flipping this back to true
 * and rebuilding restores the section exactly as it was, with no code to
 * un-comment and nothing to write again from memory.
 *
 * What it controls, so the next person does not have to find out by grepping:
 *
 *   next.config.ts    `/services` and `/services/:slug` redirect to `/` while
 *                     this is off. Redirects are checked before the
 *                     filesystem, so the pages simply never run — they are
 *                     dormant rather than gone.
 *   lib/site.ts       drops the Services entry from `liveNav`, which is what
 *                     the header, the index overlay and the footer all read.
 *   app/page.tsx      the homepage services section.
 *   sections/hero.tsx the "Seven services" call to action and the discipline
 *                     list under it.
 *   chrome/footer.tsx the seven-service column.
 *   chrome/menu.tsx   the service index and its preview pane.
 *
 * Read at build time, not per request. A change needs a rebuild, which is the
 * right trade for a flag that decides what the site is — a runtime toggle
 * would mean shipping both versions of every page to every visitor.
 */
export const SERVICES_LIVE = false;
