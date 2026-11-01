import type { Metadata } from "next";
import type { Seo } from "./types";

const SITE = "https://www.4man.co.il";

export function seoMetadata(seo: Pick<Seo, "title" | "description" | "canonical" | "robots" | "ogTitle" | "ogDescription" | "ogImage" | "ogType">): Metadata {
  const image = seo.ogImage
    ? seo.ogImage.startsWith("http")
      ? seo.ogImage
      : `${SITE}${seo.ogImage}`
    : undefined;
  return {
    title: { absolute: seo.title },
    description: seo.description || undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    robots: seo.robots || undefined,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description || undefined,
      url: seo.canonical || undefined,
      type: seo.ogType === "article" ? "article" : "website",
      siteName: "4 Man Tlv",
      images: image ? [{ url: image }] : undefined,
      locale: "he_IL",
    },
  };
}
