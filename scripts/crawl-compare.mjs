#!/usr/bin/env node
/**
 * Compare every URL in the live sitemap with the local build.
 * Usage: node scripts/crawl-compare.mjs [localBase]
 * Default local base: http://127.0.0.1:3456
 */
const localBase = (process.argv[2] || process.env.LOCAL_BASE || "http://127.0.0.1:3456").replace(/\/$/, "");

const SITEMAPS = ["https://www.4man.co.il/sitemap.xml"];

function decode(s) {
  return (s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&hellip;/gi, "…")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function norm(s) {
  return decode(s)
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i")) || tag.match(new RegExp(`${name}='([^']*)'`, "i"));
  return m ? decode(m[1]) : "";
}

function parse(html) {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1]);
  const descTag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i);
  const description = descTag ? attr(descTag[0], "content") : "";
  const canTag = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
  const canonical = canTag ? attr(canTag[0], "href") : "";
  const h1 = [];
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const text = norm(m[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " "));
    h1.push(text);
  }
  return {
    title: norm(title),
    description: norm(description),
    canonical: decodeURI(canonical.trim()),
    h1,
  };
}

async function text(url) {
  const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "4man-crawl-compare" } });
  const body = await res.text();
  return { status: res.status, final: res.url, body };
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURI(m[1].trim()));
}

const sitemapUrls = [];
for (const sm of SITEMAPS) {
  const { body } = await text(sm);
  for (const loc of locs(body)) {
    if (loc.endsWith(".xml")) continue;
    if (!sitemapUrls.includes(loc)) sitemapUrls.push(loc);
  }
}

const failures = [];
let ok = 0;
for (const liveUrl of sitemapUrls) {
  const path = new URL(liveUrl).pathname;
  const localUrl = localBase + (path === "/" ? "/" : path);
  let live;
  let local;
  try {
    [live, local] = await Promise.all([text(liveUrl), text(localUrl)]);
  } catch (err) {
    failures.push({ url: path, error: String(err) });
    continue;
  }
  const issues = [];
  if (local.status !== 200) issues.push(`local status ${local.status}`);
  if (live.status !== 200) issues.push(`live status ${live.status}`);
  const a = parse(live.body);
  const b = parse(local.body);
  if (a.title !== b.title) issues.push(`title\n    live: ${a.title}\n    local: ${b.title}`);
  if (a.description !== b.description) issues.push(`description\n    live: ${a.description.slice(0, 180)}\n    local: ${b.description.slice(0, 180)}`);
  if (a.canonical !== b.canonical) issues.push(`canonical\n    live: ${a.canonical}\n    local: ${b.canonical}`);
  if (JSON.stringify(a.h1) !== JSON.stringify(b.h1)) issues.push(`h1\n    live: ${JSON.stringify(a.h1)}\n    local: ${JSON.stringify(b.h1)}`);
  if (issues.length) failures.push({ url: path, issues });
  else ok += 1;
  process.stdout.write(issues.length ? "x" : ".");
}

console.log(`\n${ok}/${sitemapUrls.length} matched`);
for (const f of failures) {
  console.log("\n" + f.url);
  if (f.error) console.log("  " + f.error);
  for (const issue of f.issues || []) console.log("  " + issue);
}
process.exit(failures.length ? 1 : 0);
