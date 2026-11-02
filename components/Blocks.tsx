import type { ReactNode } from "react";
import Link from "next/link";
import { Faq } from "./Faq";
import { SiteImage } from "./SiteImage";
import type { Block } from "@/lib/types";

function norm(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function Blocks({ blocks, faqs = [] }: { blocks: Block[]; faqs?: { q: string; a: string }[] }) {
  const questions = new Set(faqs.map((f) => f.q.replace(/\s+/g, " ").trim()));
  const nodes: ReactNode[] = [];
  let i = 0;
  let faqUsed = false;
  while (i < blocks.length) {
    const b = blocks[i];
    if (!faqUsed && faqs.length && b.type === "h" && questions.has(norm(b.html))) {
      nodes.push(<Faq key="faq" items={faqs} />);
      faqUsed = true;
      while (i < blocks.length) {
        const n = blocks[i];
        if (n.type === "h" && !questions.has(norm(n.html)) && norm(n.html).replace(/\u200b/g, "").trim()) break;
        i += 1;
      }
      continue;
    }
    nodes.push(<BlockView key={i} block={b} />);
    i += 1;
  }
  if (!faqUsed && faqs.length) nodes.push(<Faq key="faq-end" items={faqs} />);
  return <div className="blocks">{nodes}</div>;
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "crumbs") {
    const items = block.items.filter((c) => c.text);
    return (
      <nav className="crumbs" aria-label="מיקום">
        {items.map((c, i) => (
          <span key={`${c.text}-${i}`}>
            {i > 0 ? <span aria-hidden="true"> ‹ </span> : null}
            {i < items.length - 1 && c.href ? <Link href={c.href}>{c.text}</Link> : <span className="crumb-current">{c.text}</span>}
          </span>
        ))}
      </nav>
    );
  }
  if (block.type === "h") {
    const Tag = (`h${Math.min(6, Math.max(1, block.level))}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
    if (!block.html || block.html === "\u200b" || !block.html.replace(/\u200b/g, "").trim()) {
      return <Tag className="zw" dangerouslySetInnerHTML={{ __html: block.html || "<br/>" }} />;
    }
    return <Tag dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
  if (block.type === "p") return <p dangerouslySetInnerHTML={{ __html: block.html }} />;
  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag>
        {block.items.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </Tag>
    );
  }
  if (block.type === "img") {
    const social = block.alt === "Instagram" || block.alt === "Facebook" || block.src.includes("8d689333") || block.src.includes("e316f544");
    return (
      <figure className={social ? "social-inline" : undefined}>
        <SiteImage src={block.src} alt={block.alt} width={social ? 42 : block.w} height={social ? 42 : block.h} className={social ? "social-icon" : undefined} />
      </figure>
    );
  }
  if (block.type === "a") {
    const external = block.href.startsWith("http");
    return (
      <p className="cta-row">
        <a className="btn gold" href={block.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {block.text}
        </a>
      </p>
    );
  }
  return null;
}
