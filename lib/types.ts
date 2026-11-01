export type Crumb = { text: string; href: string };

export type Block =
  | { type: "crumbs"; items: Crumb[] }
  | { type: "h"; level: number; html: string }
  | { type: "p"; html: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string; w: number; h: number }
  | { type: "a"; text: string; href: string };

export type Seo = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  h1: string[];
  jsonld: Record<string, unknown>[];
};

export type Card = {
  title: string;
  href: string;
  excerpt: string;
  read?: string;
  image?: string;
  date?: string;
  w?: number;
  h?: number;
};

export type PageData = {
  seo: Seo;
  blocks: Block[];
  faqs: { q: string; a: string }[];
  cards: Card[];
  kind: string;
  lastmod?: string;
  authored?: { path: string; title: string; date: string }[];
};

export type PostMeta = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  datePublished: string;
  dateModified: string;
  publishedLabel: string;
  readingTime: string;
  author: string;
  authorUrl: string;
  h1: string[];
  slug: string;
};
