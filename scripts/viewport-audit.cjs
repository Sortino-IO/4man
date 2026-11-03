const { chromium } = require("/tmp/4man/node_modules/playwright");
const fs = require("fs");

const VIEWPORTS = [
  [360, 740],
  [375, 667],
  [390, 844],
  [414, 896],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
];

const SITEMAPS = [
  "https://www.4man.co.il/pages-sitemap.xml",
  "https://www.4man.co.il/blog-posts-sitemap.xml",
  "https://www.4man.co.il/blog-categories-sitemap.xml",
  "https://www.4man.co.il/member-profiles_p_author-profile-chunk-sitemap.xml",
];

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURI(m[1].trim()));
}

async function urls() {
  const out = [];
  for (const sm of SITEMAPS) {
    const res = await fetch(sm);
    const body = await res.text();
    for (const loc of locs(body)) {
      if (loc.endsWith(".xml")) continue;
      const path = new URL(loc).pathname;
      if (!out.includes(path)) out.push(path);
    }
  }
  return out;
}

function auditFn() {
  const doc = document.documentElement;
  const clientW = doc.clientWidth;
  const problems = [];
  if (doc.scrollWidth > clientW + 1) problems.push(`scroll ${doc.scrollWidth}>${clientW}`);

  function clipped(el) {
    let n = el.parentElement;
    while (n && n !== document.body) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "hidden" || ox === "clip" || ox === "scroll" || ox === "auto") {
        const r = n.getBoundingClientRect();
        if (r.left >= -1 && r.right <= clientW + 1 && r.width > 0) return true;
      }
      n = n.parentElement;
    }
    return false;
  }

  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("svg, script, style")) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.bottom < 0 || r.top > 20000) continue;
    if (r.left >= -1 && r.right <= clientW + 1) {
      const ox = s.overflowX;
        if ((ox === "visible" || ox === "clip") && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && !clipped(el)) {
        const childWider = [...el.children].some((c) => c.scrollWidth > el.clientWidth + 2);
        if (!childWider) {
          const name = (el.className && el.className.toString ? el.className.toString() : "").slice(0, 48);
          offenders.push(`${el.tagName}.${name} text ${el.scrollWidth}>${el.clientWidth}`);
          if (offenders.length >= 6) break;
        }
      }
      continue;
    }
    if (clipped(el)) continue;
    const cls = (el.className && el.className.toString ? el.className.toString() : "").slice(0, 48);
    offenders.push(`${el.tagName}.${cls} L${Math.round(r.left)} R${Math.round(r.right)}`);
    if (offenders.length >= 6) break;
  }
  if (offenders.length) problems.push("overflow " + offenders.join(" | "));

  const hexes = [...document.querySelectorAll("a.hex")].map((el) => el.getBoundingClientRect());
  const title = document.querySelector(".band-title");
  if (title && hexes.length) {
    const tr = title.getBoundingClientRect();
    for (const h of hexes) {
      const hit = !(h.bottom < tr.top + 1 || h.top > tr.bottom - 1 || h.right < tr.left || h.left > tr.right);
      if (hit) {
        problems.push("title covered");
        break;
      }
    }
    for (let i = 0; i < hexes.length; i++) {
      for (let j = i + 1; j < hexes.length; j++) {
        const a = hexes[i];
        const b = hexes[j];
        const ih = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        const iw = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        if (ih > 8 && iw > 8) {
          const adx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
          if (adx < a.width * 0.28) {
            problems.push(`hex stacked dy=${Math.round(ih)} dx=${Math.round(adx)}`);
            i = hexes.length;
            break;
          }
          const area = ih * iw;
          const box = a.width * a.height;
          if (area > box * 0.45) {
            problems.push(`hex overlap ${Math.round((area / box) * 100)}%`);
            i = hexes.length;
            break;
          }
        }
      }
    }
  }

  const lists = document.querySelectorAll(".post-frame ul, .post-frame ol, .blocks ul, .blocks ol, .prose ul, .prose ol");
  let bare = 0;
  for (const list of lists) {
    if (list.closest("footer, .site-footer, .authored")) continue;
    const li = list.querySelector(":scope > li");
    if (!li || !li.innerText.trim()) continue;
    const st = getComputedStyle(list);
    const marker = getComputedStyle(li, "::marker");
    const type = st.listStyleType;
    if (type === "none" || marker.display === "none" || marker.content === "none") {
      bare++;
      continue;
    }
    const lr = li.getBoundingClientRect();
    if (lr.left < -1 || lr.right > clientW + 1) bare++;
  }
  if (bare) problems.push(`lists ${bare} missing marker or overflowing`);

  const narrow = [];
  const textNodes = document.querySelectorAll("main h1, main h2, main h3, main p, main .hero-text");
  for (const el of textNodes) {
    if (el.closest("header, footer, nav, .info-card, .post-card, .hex, .cookie, button, .reviews-badge")) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.display === "inline") continue;
    const text = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (text.length < 40) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height < 8) continue;
    const floor = Math.min(200, Math.round(clientW * 0.45));
    const long = text.length >= 80;
    if (rect.width < floor) {
      narrow.push(`${Math.round(rect.width)}px<${floor} ${el.tagName}.${(el.className || "").toString().slice(0, 24)} ${text.slice(0, 28)}`);
    } else if (long && clientW <= 900 && rect.width < clientW * 0.5) {
      narrow.push(`${Math.round(rect.width)}px<50% ${el.tagName} ${text.slice(0, 28)}`);
    }
    if (narrow.length >= 4) break;
  }
  if (narrow.length) problems.push("squeezed text " + narrow.join(" | "));

  return problems;
}

(async () => {
  const paths = await urls();
  console.log("urls", paths.length);
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/opt/google/chrome/chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const failures = [];
  const matrix = {};
  for (const [w, h] of VIEWPORTS) matrix[`${w}x${h}`] = { pass: 0, fail: 0 };

  const workers = 4;
  let cursor = 0;
  async function worker() {
    const page = await browser.newPage({ locale: "he-IL" });
    page.setDefaultTimeout(25000);
    while (cursor < paths.length) {
      const path = paths[cursor++];
      for (const [w, h] of VIEWPORTS) {
        const key = `${w}x${h}`;
        try {
          await page.setViewportSize({ width: w, height: h });
          const res = await page.goto("http://127.0.0.1:3460" + path, { waitUntil: "domcontentloaded", timeout: 25000 });
          if (!res || res.status() >= 400) {
            failures.push({ path, key, problems: [`status ${res && res.status()}`] });
            matrix[key].fail++;
            continue;
          }
          await page.waitForSelector("header", { timeout: 15000 });
          const problems = await page.evaluate(auditFn);
          if (problems.length) {
            failures.push({ path, key, problems });
            matrix[key].fail++;
          } else matrix[key].pass++;
        } catch (err) {
          failures.push({ path, key, problems: [String(err).slice(0, 180)] });
          matrix[key].fail++;
        }
      }
      process.stdout.write(".");
    }
    await page.close();
  }
  await Promise.all(Array.from({ length: workers }, () => worker()));
  console.log("\nMATRIX");
  for (const [k, v] of Object.entries(matrix)) console.log(`${k}  pass ${v.pass}  fail ${v.fail}`);
  console.log("FAILURES", failures.length);
  const grouped = {};
  for (const f of failures) {
    const sig = f.problems.join("; ").slice(0, 160);
    const g = (grouped[sig] ||= []);
    g.push(`${f.key} ${f.path}`);
  }
  for (const [sig, items] of Object.entries(grouped)) {
    console.log("\n" + sig);
    console.log(items.slice(0, 12).join("\n") + (items.length > 12 ? `\n... ${items.length}` : ""));
  }
  fs.mkdirSync("/tmp/audit", { recursive: true });
  fs.writeFileSync("/tmp/audit/failures.json", JSON.stringify({ matrix, failures }, null, 2));
  await browser.close();
  process.exit(failures.length ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
