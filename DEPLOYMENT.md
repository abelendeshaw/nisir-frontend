# Deploying nisir-frontend

## Read this part first

This app **cannot run on ordinary GoDaddy shared hosting**, and it is worth
knowing that before you spend an evening uploading files.

Shared "Web Hosting" plans — the Economy / Deluxe / Ultimate / Maximum tier —
are Apache serving PHP. They can serve files. They cannot keep a Node.js
process alive, and this app needs one on every request because:

| What it does | Where | Needs a server? |
|---|---|---|
| Signed-cookie auth redirects | `proxy.ts` | Yes — reads the live request |
| `cookies()` in the root layout | `app/layout.tsx` | Yes — every route is dynamic |
| Checkout, signup, model upload | `app/actions/` | Yes — Server Actions are POST handlers |
| Catalogue and prices | `lib/shop/catalog-server.ts` | Yes — fetched per request |

Next can export a folder of plain HTML (`output: "export"`), which *would* suit
shared hosting — but that mode supports none of the four rows above. There is no
configuration that makes this particular app work on PHP hosting. The store,
accounts and checkout are the app.

### So check one thing before anything else

Log in to cPanel and look for **Setup Node.js App** (under *Software*).

- **It's there** → follow [Path A](#path-a-cpanel-with-nodejs). Your plan can do it.
- **It isn't** → follow [Path B](#path-b-run-node-elsewhere-keep-the-domain). Your
  domain stays exactly where it is; only the app moves.

Path B is not a workaround, it is what most people do. The domain you bought is
the part that matters, and it keeps working either way.

---

## The environment variables

Two are required. The app refuses to start without them, and says which is
missing — see `lib/env.ts` and `instrumentation.ts`.

| Variable | Required | Read at | Notes |
|---|---|---|---|
| `SESSION_SECRET` | yes | runtime | Signs the session cookie. 32+ chars. |
| `NISIR_API_URL` | yes | runtime | Base URL of nisir-backend. https, unless loopback. |
| `NEXT_PUBLIC_SITE_URL` | no | **build** | Canonical origin. Baked in at `npm run build`. |
| `PORT` / `HOSTNAME` | no | runtime | Usually set for you by the host. |

`NEXT_PUBLIC_SITE_URL` is the one that catches people out. Anything prefixed
`NEXT_PUBLIC_` is compiled into the browser bundle at build time, not read from
the server's environment. Changing it means rebuilding. It must also never hold
a secret, because it ships to every visitor.

Generate a production secret — a **new** one, not the value from your laptop:

```bash
openssl rand -base64 32
```

Anyone who has that string can forge a signed-in session for the site. Rotating
it signs everyone out, which is the correct response if it ever leaks.

### Where to put them

On the server, copy the template and fill it in:

```bash
cp .env.production.example .env.production.local
chmod 600 .env.production.local
```

Next reads env files in a fixed order and stops at the first hit:

```
process.env  >  .env.production.local  >  .env.local  >  .env.production  >  .env
```

`.env.production.local` is used because it beats every other file — so a stray
`.env.local` copied up from a laptop can't silently override production. If your
host has a UI for environment variables, prefer it: real process variables beat
all of these, and nothing sensitive sits on disk.

Every `.env*` file is gitignored except the two `.example` templates.

---

## Path A: cPanel with Node.js

1. **Build the artifact locally**, with the public URL set, because it is baked in:

   ```bash
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com npm run build:standalone
   ```

   That produces `.next/standalone/` — the server plus only the `node_modules`
   it actually reaches, a few MB rather than the whole dependency tree. It also
   deletes the `.env` that `next build` copies in, so your development secret
   does not travel inside the upload.

2. **Upload the contents of `.next/standalone/`** to a folder *outside*
   `public_html` — say `/home/youruser/nisir` — as a zip, extracted in cPanel's
   File Manager. Do not put it in `public_html`; Passenger serves the app, and
   anything in the web root is downloadable, including your env file.

3. **Setup Node.js App**:
   - Application root: `nisir`
   - Application URL: your domain
   - Application startup file: `server.js`
   - Node version: 20 or newer

4. **Add the variables** in that screen's *Environment variables* section:
   `SESSION_SECRET` and `NISIR_API_URL`. Leave `PORT` alone — Passenger assigns it.

5. **Start it**, then check the log. A misconfigured app exits immediately with
   a message naming the variable at fault.

**The catch:** nisir-backend has to run somewhere too. If it is not on this
machine, `NISIR_API_URL` must be a public `https://` address. Plaintext `http`
to a remote host is rejected at startup, on purpose — every signed-in request
replays the backend access token as a `Bearer` header, and `http` would put it
on the wire in clear.

---

## Path B: run Node elsewhere, keep the domain

Deploy the app to somewhere that runs Node, then point your GoDaddy domain at
it. You keep the domain and the email; only the app is hosted elsewhere.

Anywhere that runs Node works — Vercel, Railway, Render, Fly.io, or a GoDaddy
VPS if you would rather stay with them. In each case:

1. Connect the repo (or upload the standalone build).
2. Set `SESSION_SECRET`, `NISIR_API_URL` and `NEXT_PUBLIC_SITE_URL` in the host's
   environment-variables UI. No env file needed — real process variables take
   precedence over every file.
3. Point DNS in GoDaddy (*Domains → DNS → Manage Zones*) at the host: usually an
   `A` record for `@` and a `CNAME` for `www`. The host tells you the values.
4. Let the host issue the TLS certificate.

On a bare VPS, run the standalone build under a process manager so it survives
reboots and restarts on crash:

```bash
npm run build:standalone
# copy .next/standalone/ to the server, add .env.production.local, then:
pm2 start server.js --name nisir
pm2 save && pm2 startup
```

Put nginx in front of it for TLS — Next's own docs recommend a reverse proxy
rather than exposing the Node server directly, so that malformed requests, slow
connections and rate limiting are handled before they reach the renderer.

---

## Verifying a deployment

```bash
# 1. Boots at all — a bad env exits(1) with the reason, rather than
#    staying up and serving 500s to everybody.
node server.js

# 2. Security headers are present.
curl -sI https://yourdomain.com | grep -iE 'strict-transport|x-frame|x-content|referrer|permissions'

# 3. X-Powered-By is gone (no output is the pass).
curl -sI https://yourdomain.com | grep -i x-powered-by
```

Then click through the parts that need the backend: the store lists products,
signup creates an account, and the session survives a refresh.

## Checklist

- [ ] `SESSION_SECRET` is freshly generated, not the development one
- [ ] `.env.production.local` is `chmod 600`, outside the web root
- [ ] `NISIR_API_URL` is `https://`, or loopback if the backend is on the same box
- [ ] `NEXT_PUBLIC_SITE_URL` was set *at build time*
- [ ] nisir-backend is reachable from the server, and has CORS/TLS sorted
- [ ] The app runs under a process manager that restarts it
- [ ] TLS certificate installed and http redirects to https

## Once TLS is live

`next.config.ts` sends `Strict-Transport-Security: max-age=31536000` without
`includeSubdomains`, deliberately: that directive would commit every present and
future subdomain to https for a year, and a mail or blog subdomain still on
plain http would simply stop resolving for anyone who had visited the site.
Add it — and only then `preload` — once you know every subdomain has a
certificate.

There is also no Content-Security-Policy. A useful one needs per-request nonces,
because Next injects inline bootstrap scripts and the store compiles three.js
shaders; a CSP written without them either breaks the site or is loose enough to
be decorative. It is worth doing as its own change.
