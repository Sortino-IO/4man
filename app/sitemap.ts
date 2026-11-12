import type { MetadataRoute } from "next";
import { allPagePaths, allPostSlugs } from "@/lib/content";

const ORIGIN = "https://www.4man.co.il";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...allPagePaths(), ...allPostSlugs().map((slug) => `/post/${slug}`)];
  const seen = new Set<string>();
  const urls: MetadataRoute.Sitemap = [];
  for (const path of paths) {
    const url = new URL(path, ORIGIN).href;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push({ url });
  }
  return urls;
}
