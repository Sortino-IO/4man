import Link from "next/link";
import { Blocks } from "./Blocks";
import { Reviews } from "./Reviews";
import { SiteImage } from "./SiteImage";
import { WA } from "@/lib/nav";
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
  const hero = splitHero(page.blocks);
  return (
    <article className={`page ${page.kind}`}>
      <div className="wrap">
        {hero ? (
          <>
            <section className="split">
              <SiteImage src={hero.img.src} alt={hero.img.alt} width={hero.img.w} height={hero.img.h} priority />
              <div>
                <Blocks blocks={hero.lead} />
              </div>
            </section>
            <Blocks blocks={hero.rest} faqs={page.faqs} />
          </>
        ) : (
          <Blocks blocks={page.blocks} faqs={page.faqs} />
        )}
      </div>
    </article>
  );
}

function splitHero(blocks: Block[]) {
  let i = 0;
  const lead: Block[] = [];
  if (blocks[i]?.type === "crumbs") {
    lead.push(blocks[i]);
    i += 1;
  }
  const img = blocks[i];
  if (!img || img.type !== "img") return null;
  i += 1;
  const head = blocks[i];
  if (!head || head.type !== "h") return null;
  lead.push(head);
  i += 1;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "h" && b.level === 1) {
      lead.push(b);
      i += 1;
      continue;
    }
    if (b.type === "p" || b.type === "a") {
      lead.push(b);
      i += 1;
      if (b.type === "a") break;
      continue;
    }
    break;
  }
  return { img, lead, rest: blocks.slice(i) };
}

function HomeView({ page }: { page: PageData }) {
  const blocks = page.blocks;
  const heroImg = blocks.find((b) => b.type === "img");
  const title = blocks.find((b) => b.type === "h");
  const subtitle = blocks.find((b) => b.type === "p");
  const mountain = blocks.find((b) => b.type === "img" && (b.alt === "Mountain" || b.src.includes("b2eb6890")));
  const serviceStart = blocks.findIndex((b) => b.type === "p" && strip(b.html).includes("הטיפולים של 4MAN"));
  const vito = blocks.findIndex((b) => b.type === "img" && (b.alt.includes("ויטו") || b.src.includes("1756427082374")));
  const contact = blocks.findIndex((b) => b.type === "h" && strip(b.type === "h" ? b.html : "").includes("צור קשר"));
  const services = serviceStart >= 0 ? blocks.slice(serviceStart + 1, vito > 0 ? vito : undefined).filter(isLinkPara) : [];
  const about = vito >= 0 ? blocks.slice(vito, contact > 0 ? contact : undefined) : [];
  const tail = contact >= 0 ? blocks.slice(contact) : [];
  const gallery = about.filter((b) => b.type === "img" && !(b.alt || "").includes("ויטו"));
  const aboutCopy = about.filter((b) => b.type !== "img" || (b.alt || "").includes("ויטו"));
  const portrait = aboutCopy.find((b): b is Extract<Block, { type: "img" }> => b.type === "img");

  return (
    <article className="home">
      <section className="hero">
        {heroImg && heroImg.type === "img" ? (
          <SiteImage src={heroImg.src} alt={heroImg.alt} width={heroImg.w} height={heroImg.h} priority className="hero-img" />
        ) : null}
        <div className="hero-copy">
          {title && title.type === "h" ? <h2 dangerouslySetInnerHTML={{ __html: title.html }} /> : <h2>4MAN</h2>}
          {subtitle && subtitle.type === "p" ? <p dangerouslySetInnerHTML={{ __html: subtitle.html }} /> : null}
        </div>
      </section>

      <section className="services-band" style={mountain && mountain.type === "img" ? { backgroundImage: `url(${mountain.src})` } : undefined}>
        <div className="wrap">
          <p className="band-title">הטיפולים של 4MAN</p>
          <div className="service-grid">
            {services.map((b) =>
              b.type === "p" ? <p key={b.html} dangerouslySetInnerHTML={{ __html: b.html }} /> : null,
            )}
          </div>
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
        <div className="card-grid">
          {page.cards.map((card) => (
            <article key={card.href} className="post-card">
              {card.image ? <SiteImage src={card.image} alt="" width={card.w || 1200} height={card.h || 800} /> : null}
              <h2>
                <Link href={card.href}>{card.title}</Link>
              </h2>
              {card.excerpt ? <p>{card.excerpt}</p> : null}
              <p className="meta-line">
                {card.read ? <span>{card.read}</span> : null}
                <Link href={card.href}>המשך קריאה</Link>
              </p>
            </article>
          ))}
        </div>
      </div>
    </article>
  );
}

function ContactView({ page }: { page: PageData }) {
  return (
    <article className="page contact">
      <div className="wrap center">
        <Blocks blocks={page.blocks} />
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

function isLinkPara(b: Block) {
  return b.type === "p" && b.html.includes("<a ");
}
