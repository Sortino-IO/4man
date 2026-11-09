import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageViews";
import { getPage } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  const page = getPage("/");
  if (!page) return {};
  return seoMetadata(page.seo);
}

export default function HomePage() {
  const page = getPage("/");
  if (!page) return null;
  return (
    <>
      <JsonLd data={page.seo.jsonld} />
      <PageView page={page} />
    </>
  );
}
