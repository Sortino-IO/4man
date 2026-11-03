import type { ReactNode } from "react";
import Link from "next/link";
import { Blocks } from "./Blocks";
import { Coverflow, GalleryStrip, MosaicGallery } from "./Gallery";
import { HeroVideo } from "./HeroVideo";
import { Honeycomb } from "./Honeycomb";
import { Reviews } from "./Reviews";
import { SiteImage } from "./SiteImage";
import type { Block, Card, PageData } from "@/lib/types";
import blogStats from "@/content/blog-stats.json";

export function PageView({ page }: { page: PageData }) {
  if (page.kind === "home") return <HomeView page={page} />;
  if (page.kind === "articles") return <ArticlesView page={page} />;
  if (page.kind === "contact") return <ContactView page={page} />;
  if (page.kind === "recommendations") return <RecommendationsView page={page} />;
  if (page.kind === "profile") return <ProfileView page={page} />;
  return <ContentView page={page} />;
}

function ContentView({ page }: { page: PageData }) {
  const parsed = parseLayout(page.blocks);
  const serviceHero = parsed.hero && page.kind !== "about";
  const hero = parsed.hero ? (
    <section className={serviceHero ? "split service-hero" : "split about-hero"}>
      <SiteImage
        src={parsed.hero.src}
        alt={parsed.hero.alt}
        width={parsed.hero.w}
        height={parsed.hero.h}
        priority
        className={page.seo.canonical.endsWith("/treatments/tattoo-removal") ? "hero-photo hero-tall" : "hero-photo"}
      />
      <div className="hero-text">
        {parsed.crumbs ? <Blocks blocks={[parsed.crumbs]} /> : null}
        <Blocks blocks={parsed.lead} />
      </div>
    </section>
  ) : null;
  return (
    <article className={`page ${page.kind}${page.seo.canonical.endsWith("/treatments") ? " hub" : ""}`}>
      {serviceHero ? <div className="hero-bleed">{hero}</div> : null}
      <div className="wrap">
        {serviceHero ? null : hero}
        {!parsed.hero && parsed.crumbs ? <Blocks blocks={[parsed.crumbs]} /> : null}
        <div className={parsed.hero ? "page-body" : "page-body plain"}>
          <Flow blocks={parsed.hero ? parsed.body : parsed.flow} faqs={page.faqs} />
        </div>
      </div>
    </article>
  );
}

function parseLayout(blocks: Block[]) {
  const crumbs = blocks.find((b) => b.type === "crumbs");
  const flow = blocks.filter((b) => b.type !== "crumbs");
  const hero = flow[0]?.type === "img" ? flow[0] : null;
  const rest = hero ? flow.slice(1) : flow;
  if (!hero) return { crumbs, hero: null, lead: [] as Block[], body: rest, flow: rest };
  const lead: Block[] = [];
  let i = 0;
  let h2s = 0;
  while (i < rest.length) {
    const b = rest[i];
    if (b.type === "img") break;
    if (b.type === "h" && b.level >= 2) {
      h2s += 1;
      if (h2s > 1) break;
    }
    lead.push(b);
    i += 1;
    if (b.type === "a") break;
  }
  return { crumbs, hero, lead, body: rest.slice(i), flow: rest };
}

function Flow({ blocks, faqs }: { blocks: Block[]; faqs: { q: string; a: string }[] }) {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < blocks.length) {
    if (isInfoCard(blocks, i)) {
      const cards: { title: string; href: string; img: Extract<Block, { type: "img" }> }[] = [];
      while (isInfoCard(blocks, i)) {
        const title = blocks[i];
        const link = blocks[i + 1];
        const img = blocks[i + 2];
        if (title.type === "p" && link.type === "a" && img.type === "img") {
          cards.push({ title: strip(title.html), href: link.href, img });
        }
        i += 3;
      }
      nodes.push(<InfoGrid key={key++} cards={cards} />);
      continue;
    }
    const block = blocks[i];
    if (block.type === "img" && block.src.includes("d5e8c8ea")) {
      while (blocks[i]?.type === "img") i += 1;
      nodes.push(<AboutMedia key={key++} />);
      continue;
    }
    if (blocks[i].type === "img") {
      const imgs: Extract<Block, { type: "img" }>[] = [];
      while (blocks[i]?.type === "img") {
        const img = blocks[i];
        if (img.type === "img") imgs.push(img);
        i += 1;
      }
      const banner = imgs.length === 1 && imgs[0].w >= 1600 && imgs[0].w / imgs[0].h > 1.55 && blocks[i]?.type === "h";
      if (banner) {
        const chunk: Block[] = [];
        while (i < blocks.length && !(chunk.length && isStopHeading(blocks[i]))) {
          chunk.push(blocks[i]);
          i += 1;
        }
        nodes.push(<TreatmentBanner key={key++} src={imgs[0].src} blocks={chunk} />);
        continue;
      }
      const social = imgs.every(isSocialIcon);
      if (!social && imgs.length >= 2) {
        nodes.push(<GalleryStrip key={key++} items={imgs.map((img) => ({ src: img.src, alt: img.alt || "" }))} />);
        continue;
      }
      nodes.push(
        <div key={key++} className={social ? "social-row" : "single-photo"}>
          {imgs.map((img) => (
            <SiteImage key={img.src} src={img.src} alt={img.alt} width={social ? 42 : img.w} height={social ? 42 : img.h} />
          ))}
        </div>,
      );
      continue;
    }
    const head = blocks[i];
    if (head.type === "h" && strip(head.html).includes("צור קשר")) {
      const chunk: Block[] = [blocks[i]];
      i += 1;
      while (i < blocks.length && blocks[i].type !== "h" && !isInfoCard(blocks, i)) {
        chunk.push(blocks[i]);
        i += 1;
      }
      nodes.push(<ContactSplit key={key++} blocks={chunk} />);
      continue;
    }
    const chunk: Block[] = [];
    while (i < blocks.length && !isInfoCard(blocks, i) && blocks[i].type !== "img") {
      const next = blocks[i];
      if (next.type === "h" && strip(next.html).includes("צור קשר")) break;
      chunk.push(blocks[i]);
      i += 1;
    }
    nodes.push(<Blocks key={key++} blocks={chunk} faqs={chunkHasFaq(chunk, faqs) ? faqs : []} />);
  }
  return <>{nodes}</>;
}

function isStopHeading(block: Block | undefined): block is Extract<Block, { type: "h" }> {
  return !!block && block.type === "h" && block.level <= 2;
}

function chunkHasFaq(chunk: Block[], faqs: { q: string; a: string }[]) {
  return chunk.some((b) => b.type === "h" && faqs.some((f) => strip(b.html) === f.q.replace(/\s+/g, " ").trim()));
}

function AboutMedia() {
  return (
    <>
      <Coverflow />
      <MosaicGallery />
    </>
  );
}

function isSocialIcon(img: Extract<Block, { type: "img" }>) {
  return img.alt === "Instagram" || img.alt === "Facebook" || img.src.includes("8d689333") || img.src.includes("e316f544");
}

function isInfoCard(blocks: Block[], i: number) {
  const a = blocks[i];
  const b = blocks[i + 1];
  const c = blocks[i + 2];
  return a?.type === "p" && b?.type === "a" && b.text.includes("למידע") && c?.type === "img";
}

function TreatmentBanner({ src, blocks }: { src: string; blocks: Block[] }) {
  return (
    <section className="treatment-banner" style={{ backgroundImage: `url(${src})` }}>
      <div className="treatment-banner-inner">
        <Blocks blocks={blocks} />
      </div>
    </section>
  );
}

function InfoGrid({ cards }: { cards: { title: string; href: string; img: Extract<Block, { type: "img" }> }[] }) {
  const rows = Math.ceil(cards.length / 2);
  return (
    <div className="info-grid" style={{ ["--info-rows" as string]: rows }}>
      {cards.map((card) => (
        <Link key={card.href + card.title} href={card.href} className="info-card">
          <SiteImage src={card.img.src} alt={card.img.alt || card.title} width={card.img.w} height={card.img.h} />
          <span className="info-cap">
            <span className="info-title">{card.title}</span>
            <span className="info-more">למידע נוסף</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function HomeView({ page }: { page: PageData }) {
  const blocks = page.blocks;
  const title = blocks.find((b) => b.type === "h");
  const subtitle = blocks.find((b) => b.type === "p");
  const mountain = blocks.find((b) => b.type === "img" && (b.alt === "Mountain" || b.src.includes("b2eb6890")));
  const vito = blocks.findIndex((b) => b.type === "img" && (b.alt.includes("ויטו") || b.src.includes("1756427082374")));
  const contact = blocks.findIndex((b) => b.type === "h" && strip(b.type === "h" ? b.html : "").includes("צור קשר"));
  const about = vito >= 0 ? blocks.slice(vito, contact > 0 ? contact : undefined) : [];
  const tail = contact >= 0 ? blocks.slice(contact) : [];
  const gallery = about.filter((b) => b.type === "img" && !(b.alt || "").includes("ויטו"));
  const aboutCopy = about.filter((b) => b.type !== "img" || (b.alt || "").includes("ויטו"));
  const portrait = aboutCopy.find((b): b is Extract<Block, { type: "img" }> => b.type === "img");

  return (
    <article className="home">
      <section className="hero">
        <HeroVideo />
        <div className="hero-copy">
          {title && title.type === "h" ? <h2 dangerouslySetInnerHTML={{ __html: title.html }} /> : <h2>4MAN</h2>}
          {subtitle && subtitle.type === "p" ? <p dangerouslySetInnerHTML={{ __html: subtitle.html }} /> : null}
        </div>
      </section>

      <section className="services-band" style={mountain && mountain.type === "img" ? { backgroundImage: `url(${mountain.src})` } : undefined}>
        <div className="wrap">
          <p className="band-title">הטיפולים של 4MAN</p>
          <Honeycomb />
        </div>
      </section>

      <section className="about-band">
        <div className="wrap about-grid">
          <div className="about-copy">
            <Blocks blocks={aboutCopy.filter((b) => b.type !== "img")} />
          </div>
          {portrait ? <SiteImage src={portrait.src} alt={portrait.alt} width={portrait.w} height={portrait.h} className="portrait" /> : null}
        </div>
        {gallery.length ? <MosaicGallery /> : null}
      </section>

      <section className="contact-band">
        <div className="wrap contact-grid">
          <div>
            <Blocks blocks={tail} />
          </div>
          <Map />
        </div>
      </section>
    </article>
  );
}

function ArticlesView({ page }: { page: PageData }) {
  const page2 = page.seo.canonical.endsWith("/articles/page/2");
  return (
    <article className="page articles">
      <div className="wrap">
        <Blocks blocks={page.blocks.filter((b) => b.type === "crumbs")} />
        <p className="all-posts">
          <Link href="/articles">All Posts</Link>
        </p>
        <div className="card-grid">
          {page.cards.map((card) => (
            <BlogCard key={card.href} card={card} />
          ))}
        </div>
        <p className="blog-pager">
          {page2 ? <Link href="/articles">עמוד קודם</Link> : <Link href="/articles/page/2">עמוד הבא</Link>}
        </p>
      </div>
    </article>
  );
}

export function BlogCard({ card }: { card: Card }) {
  const slug = decodeURIComponent(card.href.replace(/^\/post\//, ""));
  const stat = (blogStats as Record<string, { views: number; comments: number }>)[slug] || { views: 0, comments: 0 };
  return (
    <article className="post-card">
      {card.read ? <p className="read-time">{card.read}</p> : null}
      <h2>
        <Link href={card.href}>{card.title}</Link>
      </h2>
      {card.excerpt ? <p>{card.excerpt}</p> : null}
      <footer className="post-card-foot">
        <span>
          {stat.views} צפיות · {stat.comments} תגובות
        </span>
        <span className="heart" aria-hidden="true">
          ♡
        </span>
      </footer>
    </article>
  );
}

function ContactView({ page }: { page: PageData }) {
  const socials = page.blocks.filter((b): b is Extract<Block, { type: "img" }> => b.type === "img" && isSocialIcon(b));
  const rest = page.blocks.filter((b) => !(b.type === "img" && isSocialIcon(b)) && !(b.type === "a" && !b.text.trim()));
  const buttonAt = rest.findIndex((b) => b.type === "a");
  const before = buttonAt >= 0 ? rest.slice(0, buttonAt) : rest;
  const after = buttonAt >= 0 ? rest.slice(buttonAt) : [];
  return (
    <article className="page contact">
      <div className="wrap center">
        <Blocks blocks={before} />
        {socials.length ? (
          <div className="social-row">
            {socials.map((img) => (
              <SiteImage key={img.src} src={img.src} alt={img.alt} width={42} height={42} className="social-icon" />
            ))}
          </div>
        ) : null}
        <Blocks blocks={after} />
      </div>
    </article>
  );
}

function RecommendationsView({ page }: { page: PageData }) {
  return (
    <article className="page recommendations">
      <div className="wrap">
        <Blocks blocks={page.blocks} />
        <Reviews />
      </div>
    </article>
  );
}

function ProfileView({ page }: { page: PageData }) {
  const name = page.seo.h1[0] || "";
  return (
    <article className="page profile">
      <div className="profile-banner">
        <div>
          <SiteImage src="/media/fb072e_d47657eb267c4784bb1f4731be2a755c~mv2.png" alt="" width={72} height={72} className="avatar" />
          <h1>{name}</h1>
        </div>
      </div>
      <div className="wrap">
        <Blocks blocks={page.blocks.filter((b) => !(b.type === "h" && b.level === 1))} />
        {page.authored && page.authored.length ? (
          <section>
            <h2>פוסטים</h2>
            <ul className="authored">
              {page.authored.map((p) => (
                <li key={p.path}>
                  <Link href={p.path}>{p.title}</Link>
                  {p.date ? <small> {p.date}</small> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function ContactSplit({ blocks }: { blocks: Block[] }) {
  return (
    <section className="about-contact">
      <div className="about-contact-card">
        <Blocks blocks={blocks} />
        <div className="social-row">
          <a href="https://www.instagram.com/4mantlv?igsh=MTJrZnl6dm5jMGEyaA==" target="_blank" rel="noopener noreferrer">
            <img src="/media/8d6893330740455c96d218258a458aa4.png" alt="Instagram" width={36} height={36} />
          </a>
          <a href="https://www.facebook.com/4mantlv/" target="_blank" rel="noopener noreferrer">
            <img src="/media/e316f544f9094143b9eac01f1f19e697.png" alt="Facebook" width={36} height={36} />
          </a>
        </div>
      </div>
      <Map />
    </section>
  );
}

function Map() {
  return (
    <iframe
      className="map"
      title="מפה - רחוב ריינס 18, תל אביב"
      src="https://maps.google.com/maps?q=%D7%A8%D7%97%D7%95%D7%91%20%D7%A8%D7%99%D7%99%D7%A0%D7%A1%2018%20%D7%AA%D7%9C%20%D7%90%D7%91%D7%99%D7%91&hl=he&z=16&output=embed"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function strip(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

