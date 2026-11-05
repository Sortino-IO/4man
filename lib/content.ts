import fs from "fs";
import path from "path";
import matter from "gray-matter";
import pagesJson from "@/content/pages.json";
import postsIndex from "@/content/posts-index.json";
import reviewsJson from "@/content/reviews.json";
import type { PageData, PostMeta } from "./types";

const pages = pagesJson as unknown as Record<string, PageData>;

export function getPage(pathname: string): PageData | undefined {
  return pages[pathname];
}

export function allPagePaths(): string[] {
  return Object.keys(pages);
}

export type PostIndexItem = {
  slug: string;
  path: string;
  title: string;
  h1: string;
  description: string;
  datePublished: string;
  dateModified: string;
  publishedLabel: string;
  readingTime: string;
  author: string;
  authorUrl: string;
  image: string;
  lastmod: string;
};

export function getPostsIndex(): PostIndexItem[] {
  return postsIndex as PostIndexItem[];
}

export function getPost(slug: string): { meta: PostMeta; content: string; jsonld: Record<string, unknown>[] } | null {
  const file = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Omit<PostMeta, "slug">;
  const ldPath = path.join(process.cwd(), "content", "posts", `${slug}.jsonld.json`);
  const jsonld = fs.existsSync(ldPath) ? (JSON.parse(fs.readFileSync(ldPath, "utf8")) as Record<string, unknown>[]) : [];
  return { meta: { ...data, slug, h1: data.h1 || [] }, content: parsed.content, jsonld };
}

export function allPostSlugs(): string[] {
  const dir = path.join(process.cwd(), "content", "posts");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.slice(0, -4));
}

export function getReviews() {
  return reviewsJson as {
    stats: { reviews_count: number; overall_rating: string } | null;
    items: { name: string; rating: number; text: string; date: string; city: string }[];
  };
}
