import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageViews";
import { allPagePaths, getPage } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string[] }> };

function pathname(slug: string[]) {
  return "/" + slug.map(decodeURIComponent).join("/");
}

export function generateStaticParams() {
  return allPagePaths()
    .filter((p) => p !== "/" && !p.startsWith("/post/") && !p.startsWith("/profile/"))
    .map((p) => ({ slug: p.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(pathname(slug));
  if (!page) return {};
  return seoMetadata(page.seo);
}

export default async function CatchAll({ params }: Props) {
  const { slug } = await params;
  const page = getPage(pathname(slug));
  if (!page) notFound();
  return (
    <>
      <JsonLd data={page.seo.jsonld} />
      <PageView page={page} />
    </>
  );
}
