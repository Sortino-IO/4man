import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageViews";
import { getPage } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

const USERS = ["info43978", "analyst40868", "erez18010338144"];

type Props = { params: Promise<{ user: string }> };

export function generateStaticParams() {
  return USERS.map((user) => ({ user }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await params;
  const page = getPage(`/profile/${user}/profile`);
  if (!page) return {};
  return seoMetadata(page.seo);
}

export default async function ProfilePage({ params }: Props) {
  const { user } = await params;
  const page = getPage(`/profile/${user}/profile`);
  if (!page) notFound();
  return (
    <>
      <JsonLd data={page.seo.jsonld} />
      <PageView page={page} />
    </>
  );
}
