import type { ReactNode } from "react";
import Link from "next/link";
import { Blocks } from "./Blocks";
import { HeroVideo } from "./HeroVideo";
import { Honeycomb } from "./Honeycomb";
import { Reviews } from "./Reviews";
import { SiteImage } from "./SiteImage";
import type { Block, PageData } from "@/lib/types";

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
  return (
    <article className={`page ${page.kind}`}>
      <div className="wrap">
        {parsed.hero ? (
          <section className="split service-hero">
            <SiteImage src={parsed.hero.src} alt={parsed.hero.alt} width={parsed.hero.w} height={parsed.hero.h} priority className="hero-photo" />
            <div className="hero-text">
              {parsed.crumbs ? <Blocks blocks={[parsed.crumbs]} /> : null}
              <Blocks blocks={parsed.lead} />
            </div>
          </section>
        ) : parsed.crumbs ? (
          <Blocks blocks={[parsed.crumbs]} />
        ) : null}
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
  while (i < rest.length) {
    const b = rest[i];
    if (b.type === "h" && b.level >= 2) break;
    if (b.type === "img") break;
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
    if (blocks[i].type === "img") {
      const imgs: Extract<Block, { type: "img" }>[] = [];
      while (blocks[i]?.type === "img") {
        const img = blocks[i];
        if (img.type === "img") imgs.push(img);
        i += 1;
      }
      const social = imgs.every(isSocialIcon);
      nodes.push(
        <div key={key++} className={social ? "social-row" : imgs.length >= 3 ? "cert-row" : "single-photo"}>
          {imgs.map((img) => (
            <SiteImage key={img.src} src={img.src} alt={img.alt} width={social ? 42 : img.w} height={social ? 42 : img.h} />
          ))}
        </div>,
      );
      continue;
    }
    const start = i;
    const chunk: Block[] = [];
    while (i < blocks.length && !isInfoCard(blocks, i) && blocks[i].type !== "img") {
      chunk.push(blocks[i]);
      i += 1;
    }
    nodes.push(<Blocks key={key++} blocks={chunk} faqs={chunkHasFaq(chunk, faqs) ? faqs : []} />);
  }
  return <>{nodes}</>;
}

function chunkHasFaq(chunk: Block[], faqs: { q: string; a: string }[]) {
  return chunk.some((b) => b.type === "h" && faqs.some((f) => strip(b.html) === f.q.replace(/\s+/g, " ").trim()));
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

function InfoGrid({ cards }: { cards: { title: string; href: string; img: Extract<Block, { type: "img" }> }[] }) {
  return (
    <div className="info-grid">
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
        {gallery.length ? (
          <div className="wrap gallery">
            {gallery.map((b) =>
              b.type === "img" ? <SiteImage key={b.src} src={b.src} alt={b.alt} width={b.w} height={b.h} /> : null,
            )}
          </div>
        ) : null}
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
  return (
    <article className="page articles">
      <div className="wrap">
        <Blocks blocks={page.blocks.filter((b) => b.type === "crumbs")} />
        <p className="all-posts">
          <Link href="/articles">All Posts</Link>
        </p>
        <div className="card-grid">
          {page.cards.map((card) => (
            <article key={card.href} className="post-card">
              {card.read ? <p className="read-time">{card.read}</p> : null}
              <h2>
                <Link href={card.href}>{card.title}</Link>
              </h2>
              {card.excerpt ? <p>{card.excerpt}</p> : null}
            </article>
          ))}
        </div>
      </div>
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

