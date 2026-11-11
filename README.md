# 4MAN — Next.js migration

Hebrew, RTL site for the 4MAN men's clinic in Tel Aviv (`https://www.4man.co.il`), rebuilt from the live Wix site so it can be deployed on Vercel.

The canonical host stays `https://www.4man.co.il`. Every URL in the live sitemap is regenerated at the same path (`trailingSlash: false`). Blog posts live in `content/posts` as MDX. Images are files under `public/media` (nothing is hotlinked from `static.wixstatic.com`).

## Run

```bash
npm install
npm run build
npm start
npm run crawl   # compares the 70 sitemap URLs with a server on http://127.0.0.1:3456
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_META_PIXEL_ID` when the pixel id is known. It is not in the live HTML.

## Tracking and redirects

- Google Tag Manager `GTM-M9B7BMF` and GA4 `G-4Y0XK68961` load on every page, as on the live site.
- Meta Pixel renders only when `NEXT_PUBLIC_META_PIXEL_ID` is set.
- `middleware.ts` returns **301** for `/blog` and `/blog/*` → `/articles`, `/hl-products` and `/hl-products/*` → `/`, `/articles/page/1` and `/articles/page/3` → `/articles` (those two pagination URLs redirect on the live site), and `/post/cne-treatment-for-men-causes-and-solutions` → `/post/acne-treatment-for-men-causes-and-solutions`. `/articles/page/2` stays, because it is a real self-canonical page even though Wix omitted it from the sitemap.
- Apex `4man.co.il` → `https://www.4man.co.il` is also a **301** in middleware. On Vercel, add both `www.4man.co.il` (primary) and `4man.co.il`. This is a domain-level redirect, same as today; point DNS only after mail records (MX, SPF, DKIM) are copied. Do not transfer the registrar in the middle of the cutover.

## What replaced Wix widgets

| Live | This site |
|---|---|
| Wix Blog | MDX in `content/posts`, `/articles` index, `/blog-feed.xml` |
| Wix FAQ | React accordion on the facial FAQ page. FAQPage JSON-LD was not on the live page, so it was not added. |
| Pro Gallery / Honeycomb | Static image grid and a service-link grid |
| Google Reviews widget | Static snapshot taken on 1 Nov 2026 (80 reviews, rating 4.9) plus the original review images. It does not refresh from Google. A small 4.9 badge links to `/recommendations`. |
| Usercentrics | Local cookie banner with the same Hebrew controls (accept all, reject, save). Choice is stored in `localStorage`. It is not the Usercentrics account, and it does not block GTM (the live page loads GTM as well). |
| Wix Google Map | Google Maps embed for רחוב ריינס 18, תל אביב |
| WhatsApp | Header button and CTAs to `https://wa.me/972503800066` |
| Forms | None. The owner confirmed the new site has no contact forms. |
| Members | The three `/profile/<user>/profile` URLs are static author pages |

`html` is `lang="he"` `dir="rtl"`. Per-page title, description, canonical (`https://www.4man.co.il/...`), Open Graph, robots, and JSON-LD are copied from the live pages. `og:image` points at the same file on this host. `sitemap.xml` is the same sitemap index and child sitemaps as live. `robots.txt` matches live, including `Disallow: *?lightbox=`.

## SEO notes (suggestions only — not changed)

These are already true on the live site. They were copied as-is so the migration does not rewrite titles or headings.

- 18 of the 70 sitemap URLs have no meta description (home has one; many posts and a few service pages do not).
- Home and `/articles` have no H1. Several pages have more than one H1, including empty Wix placeholder H1s (zero-width space or a bare `<br>`).
- The articles title says `הסרת שער` (missing י). A visible home CTA says `שלח וואסטאפ` (missing ט).
- Some images are published with an empty `alt`. Those alts were not invented.
- No `hreflang`.
- `/articles/page/2` is indexable and self-canonical but missing from the Wix sitemap. It is served here and still omitted from `sitemap.xml`, so the sitemap URL set stays identical.
- Meta Pixel id is unknown (not in the HTML; likely GTM or Wix Marketing).
- A `tel:0772308172` link exists in the Wix DOM. It is not part of the visible footer copy, so it was not added to the footer.

## Not pixel-identical

Wix absolute positioning, slideshow motion, and the Pro Gallery lightbox are not reproduced. The pages use the same photos, colors (black, white, gold `#fed100`), Rubik, navigation, and text, in normal document flow. The footer line `©Build by Adi Tahar. Powered and secured by Wix` is kept because it is visible copy on the live site. Wix Bookings / Stores do not have product URLs in the sitemap; `/inquiry-services-page` is the empty "Pick a Service" state. There is no Wix accessibility widget beyond the skip link and the accessibility statement.

## Verification

`npm run build` completes, and `node scripts/crawl-compare.mjs` against the production server matched **70/70** sitemap URLs (HTTP 200, title, meta description, canonical, H1) on 1 Nov 2026. Desktop and mobile screenshots of home, the laser service page, `/articles`, and one post are in the PR.
