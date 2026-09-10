# Nisir

The site for Nisir Designs — a multidisciplinary practice working across web,
apps, brand, motion, 3D modelling, 3D printing and fashion education, from
Ontario and Addis Ababa.

## Running it

Two processes. The storefront renders nothing on its own — the root layout
awaits `GET /catalog`, so with no backend up every page throws rather than
showing an empty store.

**1. Start nisir-backend-php** (the catalogue, auth and orders):

```bash
cd ../nisir-backend-php
composer install && npm install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed        # needs MySQL/MariaDB per its .env
php artisan serve                 # http://localhost:8000
```

**2. Configure this app.** `.env.local` is gitignored; `.env.example` is the
template and documents every variable:

```bash
cp .env.example .env.local
openssl rand -base64 32           # paste into SESSION_SECRET
```

`SESSION_SECRET` signs the session cookie — any 32+ character random string
works, it is not shared with the backend and nothing else has to know it.
Changing it signs everyone out. `NISIR_API_URL` must match wherever step 1 is
listening (`http://localhost:8000` by default).

Both are validated at boot by `lib/env.ts`, so a missing or malformed one
stops the server with a message naming it rather than failing later in front
of a visitor.

**3. Start this app:**

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

Deploying is a different story with its own footguns — see [DEPLOYMENT.md](DEPLOYMENT.md).

## Design system

**Slabs.** The page is built from full-bleed bands — INK, GOLD, BONE — that hand
off to each other with no margin between them, and display type runs to the page
margin. There is no day/night toggle: the site commits to one look, which is what
makes it read as directed rather than configurable.

| Token  | Value     | Role                                    |
| ------ | --------- | --------------------------------------- |
| Bone   | `#EFEDE6` | the paper                               |
| Ink    | `#0A1220` | Nisir midnight navy, pushed darker      |
| Gold   | `#D4AF37` | slabs, accents, the index hover flood   |

A slab class re-points the semantic tokens (`--fg`, `--muted`, `--line`,
`--accent`, `--surface`) at itself, so any component dropped onto one inherits
the right ink without knowing which slab it landed on. Every page opens on an
ink slab, which is what lets the fixed header hold one colour the whole way
down.

**One typeface.** Inter, variable, everywhere. Contrast comes from weight:
display at 800 with tracking pulled to -0.05em, accent words dropped to 200
(`.thin`), structure at 400–600. A single family across that range reads as art
direction; three families read as indecision. The brand calls for PP Mori, which
is licensed and can't be bundled — swap it in at [lib/fonts.ts](lib/fonts.ts);
nothing references a family by name.

The type scale (`.d0`–`.d4`, `.d2-row`, `.lede`, `.tag`) and the shared controls
all live in [app/globals.css](app/globals.css).

## Structure

```
app/                      routes — /, /services, /services/[slug],
                          /studio, /store, /contact
components/chrome/        header, overlay menu, footer, cursor, intro, clocks
components/sections/      page sections, composed by the routes
components/ui/            motion primitives (see below)
components/forms/         the one inquiry form, shared by all eight forms
lib/services.ts       the seven services — one source for the index,
                          menu, footer, detail pages and their form fields
lib/site.ts               nav, locations, contact, stats
```

## Motion primitives

`components/ui/` is a small local library built on [Motion](https://motion.dev),
in the spirit of Magic UI / Animate UI / hover.dev — vendored rather than
installed, so each piece can be tuned to this palette.

| Component      | What it does                                                     |
| -------------- | ---------------------------------------------------------------- |
| `Reveal`       | block rises and un-blurs once, on entry                          |
| `Lines`        | display type climbs out from behind its own baseline             |
| `Stagger`      | a list, each child offset from the last                          |
| `TextReveal`   | words light from faint to full ink at scroll speed               |
| `Beam`         | measured signal arc between two DOM nodes                        |
| `Ticker`       | figures count up once, on entry                                  |
| `Marquee`      | seamless endless band                                            |
| `Magnetic`     | element leans toward the pointer, springs back                   |
| `FlipLink`     | letters flip out and in on hover                                 |
| `Scramble`     | label resolves itself out of noise                               |
| `MagicCard`    | border and field light where the cursor is                       |
| `Tilt`         | slight three-dimensional lean                                    |
| `Plate`        | the procedural artwork — see below                               |

### Plates

There is no photography in this practice yet, and grey placeholder boxes would
undo everything else on the page. So each service draws its own figure
instead — a hairline construction in ink and gold, one per discipline, slow
enough to read as a diagram rather than a loading state. Seven figures (`grid`,
`stack`, `solid`, `wave`, `lattice`, `orbit`, `weave`), deterministic per slug,
with a `variant` prop that tilts and zooms so a row never reads as a repeat.
Replace them with real work as it is photographed —
[components/ui/plate.tsx](components/ui/plate.tsx).

## Deliberate gaps

- **Forms don't transmit.** All eight are front-end prototypes with real
  validation and a stated "does not send yet" note. Wire them to a handler.
- **The store doesn't transact.** Checkout, payment, fulfilment and reviews are
  listed as pending on the page rather than implied by a disabled button.
- **Leadership has no name.** [app/studio/page.tsx](app/studio/page.tsx) leaves
  the founder block empty on purpose — inventing a bio would break the third
  principle stated on that same page.

## Accessibility & motion

`prefers-reduced-motion` is honoured throughout: the intro curtain is skipped,
the custom cursor never mounts, counters arrive at their value, and travel
animations become fades. Reduced-motion state is read through
`useSyncExternalStore` ([lib/hooks.ts](lib/hooks.ts)) rather than sampled during
render, so the server and client never disagree at hydration. The native cursor
is left alone on every form control, and the custom one avoids `mix-blend-mode`
— `difference` over a gold slab inverts to blue.
