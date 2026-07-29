# IBERIA — Hunters' Club

Website for **მონადირეთა კლუბი „იბერია"** (Iberia Hunters' Club), a Georgian hunting club founded in 2023.

**Live:** [iberia.org.ge](https://iberia.org.ge)

Built and deployed end to end — front end, back end, server administration, DNS, mail and SEO — with no site builder, no template and no front-end framework.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Front end](#front-end)
- [Back end](#back-end)
- [Infrastructure](#infrastructure)
- [Security](#security)
- [SEO](#seo)
- [Performance](#performance)
- [Local development](#local-development)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Features

**For visitors**

| Page | What it does |
|---|---|
| `index.html` | Landing page with animated hero, club introduction, upcoming event and latest trips |
| `about.html` | Club mission, aims, milestone timeline, image slideshow |
| `expeditions.html` | Hunting trips by country — each opens a photo story viewer |
| `events.html` | Current event with registration + archive of past events (view-only) |
| `event.html` | Single event detail with a two-branch registration form |
| `members.html` | Member grid with profile modals and per-member photo slideshows |
| `gallery.html` | Category-filtered photo gallery with lightbox navigation |
| `videos.html` | Club videos playing in-page via privacy-preserving embeds |
| `contact.html` | Contact form wired to the same back end |

**Cross-cutting**

- Full **Georgian / English** bilingual support with a runtime toggle
- Responsive from six-column desktop grids down to single-column mobile
- Keyboard-navigable modals (arrow keys, `Esc`) and focusable cards

---

## Tech stack

| Layer | Technology |
|---|---|
| Markup / styling | Hand-written HTML5, CSS3 (custom properties, grid, flexbox) |
| Scripting | Vanilla JavaScript (ES5-compatible, no build step, no dependencies) |
| Back end | PHP (no framework) |
| Data | CSV flat files written outside the web root |
| Server | Self-managed VPS, administered via **HestiaCP** |
| Web server | Nginx + Apache (HestiaCP default stack) |
| Mail | HestiaCP mail stack + Roundcube webmail |
| TLS | Let's Encrypt (web, webmail and mail) |
| DNS | Authoritative zone hosted on the same server |
| Version control | Git / GitHub |

No npm, no bundler, no CSS preprocessor. Every asset is served as authored.

---

## Project structure

```
.
├── index.html              # Home
├── about.html              # Club, aims, timeline
├── expeditions.html        # Hunting trips (story viewer)
├── events.html             # Current + archived events
├── event.html              # Event detail + registration form
├── members.html            # Member grid + profile modals
├── gallery.html            # Filterable gallery + lightbox
├── videos.html             # Video grid + in-page player
├── contact.html            # Contact form
├── news.html               # Legacy redirect → videos.html
├── handler.php             # Form back end (registration + contact)
├── sitemap.xml             # 9 indexed URLs
├── robots.txt              # Crawl policy + sitemap pointer
└── assets/
    ├── style.css           # Single stylesheet (~22 KB)
    ├── app.js              # Single script (~17 KB)
    ├── favicon.png
    ├── logo-bone.png       # Club crest, light variant
    ├── logo-brass.png      # Club crest, brass variant
    ├── mark-bone.png       # Compact mark
    ├── mark-brass.png
    ├── members/            # Member portraits (3:4, 640×853)
    └── photos/             # Trip, event and gallery imagery
```

> **Note:** the `private/` directory holding submitted form data lives on the server **outside** the web root and is intentionally **not** in this repository — it contains personal data.

---

## Front end

**No framework by design.** The site is nine static pages sharing one stylesheet and one script. Total JS payload is ~17 KB unminified.

### Bilingual system

Content is authored inline in both languages and switched with CSS rather than duplicated templates or a translation library:

```css
html[lang=ka] [data-en],
html[lang=en] [data-ka] { display: none !important; }
```

Only the *inactive* language is hidden — the visible one keeps its natural display value, so the rule never fights component layout. Language choice persists via `localStorage`.

### Interaction

- **Modal system** — one shared pattern powers member profiles, the expedition/event story viewer, the gallery lightbox and the video player. All close on backdrop click, ✕, or `Esc`; the story viewer and lightbox also accept ← / → keys.
- **Story viewer** — `data-photos` on any card supplies a photo set; the viewer paginates through it with a counter, alongside a headline, date, location and body text.
- **Gallery filtering** — category buttons filter `figure` elements by `data-cat`; the lightbox then navigates only the visible subset.
- **Slideshows** — any `.slideshow` container auto-crossfades its child images on a 3.5 s cycle, staggered per instance so multiple slideshows don't flip in unison. Used on the About/Home imagery and on individual member cards and profiles.
- **Video player** — YouTube videos play in-page through `youtube-nocookie.com` embeds. Titles are fetched at runtime from the oEmbed API, so they stay accurate if a video is renamed upstream. Closing the modal clears the `iframe` `src` to stop playback.
- **Scroll reveals** — `IntersectionObserver` with a zero threshold and a small negative root margin, so elements taller than the viewport still trigger (a threshold-based approach silently fails on long mobile pages).

---

## Back end

`handler.php` serves both the event registration form and the contact form. It has no framework and no database.

**Design principle: dual persistence.** Every submission is written to a CSV *and* emailed. If mail delivery fails, the record still exists on disk; if the disk write fails, the operator is still notified. A submission cannot vanish silently.

```
POST /handler.php
  action=register | contact
  → append row to  ../private/{registrations|messages}.csv
  → send notification mail (Reply-To = submitter)
  → respond { "ok": true, "mail": "sent" | "mail_failed" }
```

**Registration payload** captures event, registrant type (individual / club representative), club name, first name, last name, email and phone. The club branch collects the club first, then personal details, with a free-text field revealed when "Other" is selected.

**Storage** targets `web/<domain>/private/`, a sibling of `public_html` — not web-accessible. If that directory is unwritable, the handler falls back to a local `_data/` directory rather than discarding the submission, and reports which path it used.

---

## Infrastructure

Everything runs on a single self-managed VPS administered through **HestiaCP**.

| Component | Configuration |
|---|---|
| Web | Domain with forced HTTPS |
| DNS | Authoritative zone on the same host — A, CNAME, MX, TXT, SRV, CAA records |
| Mail | Mail domain with per-member mailboxes, Roundcube webmail on its own subdomain |
| TLS | Let's Encrypt certificates for web, webmail and mail, auto-renewed |
| Backups | Panel-managed |

**Mail service ports:** IMAP `993` (SSL/TLS), SMTP submission `587` (STARTTLS).

---

## Security

**Transport**
- HTTPS enforced site-wide; TLS on webmail and mail services
- `CAA` record restricting certificate issuance to Let's Encrypt

**Mail authentication** — the full trifecta, so the domain cannot be trivially forged:

| Record | Value |
|---|---|
| SPF | `v=spf1 a mx ip4:<server-ip> -all` — strict `-all`, not `~all` |
| DKIM | RSA signing on all outbound mail (`mail._domainkey`) |
| DMARC | `v=DMARC1; p=quarantine; pct=100` |

Inbound mail passes through spam filtering and antivirus scanning.

**Form handling**
- Server-side validation of every field (`FILTER_VALIDATE_EMAIL`, required-field checks) — client validation is treated as a convenience, never a control
- **Honeypot field** — a hidden input real users never populate; submissions that fill it receive a success response and are silently discarded
- **Header-injection guard** — CR/LF and their encoded forms stripped from all user input before it reaches mail headers
- Message length capped to bound payload size
- Submitted data stored **outside the web root**, so it is not reachable over HTTP
- The endpoint returns opaque errors and leaks no filesystem paths

**Operational**
- Unique per-mailbox credentials; panel-level brute-force protection (Fail2Ban)
- Personal data (`private/`) deliberately excluded from version control

---

## SEO

- Per-page `<title>`, meta description, canonical URL
- Open Graph and Twitter Card tags — link previews render with the club crest and a real description
- **JSON-LD structured data** using the `SportsClub` schema
- `sitemap.xml` covering all nine indexed URLs, referenced from `robots.txt`
- **Google Search Console** domain property, verified by DNS `TXT` record, with the sitemap submitted
- `lang` attributes on every language-switched element for correct language detection

---

## Performance

- **Cache-busting via versioned query strings** (`style.css?v=N`, `app.js?v=N`), incremented on every asset change. This is deployment-critical: without it, browsers serve stale CSS/JS against fresh HTML — the single most common source of "works locally, broken in production."
- **Image optimisation** — the crest PNGs were reduced from 243 KB to 151 KB (~40%) by quantising the alpha channel rather than downscaling. Counter-intuitively, downsampling *increased* file size: the source has near-binary edges that PNG compresses efficiently, and resampling smears them into gradients. Measured, not assumed.
- Progressive JPEGs; portrait imagery normalised to a uniform 3:4 at 640×853
- `loading="lazy"` on all below-fold imagery
- Single CSS and single JS request — no bundler, no waterfall

**Mobile-specific fixes**
- `100svh` alongside `100vh` so the hero isn't clipped by iOS Safari's browser chrome
- 16px form inputs, preventing iOS from auto-zooming on focus
- Grid breakpoints stepping 6 → 4 → 3 → 2 → 1 columns

---

## Local development

No build step. Clone and open:

```bash
git clone https://github.com/<user>/IBERIA.git
cd IBERIA
```

Static pages can be opened directly in a browser. To exercise `handler.php`, serve the project through PHP:

```bash
php -S localhost:8000
```

Then visit `http://localhost:8000`.

> Form submissions require PHP. Opening `event.html` as a `file://` URL will render the form but cannot submit — the request has no server to reach.

---

## Deployment

The repository and the production server are **not** linked; deployment is a manual file sync.

1. Commit and push to GitHub
2. Upload changed files via the HestiaCP File Manager, preserving structure:
   - `*.html`, `handler.php`, `sitemap.xml`, `robots.txt` → `public_html/`
   - `assets/**` → `public_html/assets/`
3. Increment the `?v=` version on `style.css` / `app.js` whenever either changes
4. Verify file size and timestamp in the File Manager after upload

**Verify, don't assume.** The majority of production-only bugs on this project traced to an asset that silently failed to overwrite, or a browser serving a cached copy — not to application code.

---

## Roadmap

- [ ] Replace remaining demo copy with the club's own expedition and event write-ups
- [ ] Populate member roles
- [ ] Migrate form storage from CSV to MySQL as submission volume grows
- [ ] Reverse DNS (PTR) record for the mail server to improve deliverability
- [ ] Rebuild the front end in React once content has stabilised

---

## License

Content, photography and the club crest are the property of Iberia Hunters' Club and are not licensed for reuse.
