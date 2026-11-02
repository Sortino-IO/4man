import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { JsonLd } from "@/components/JsonLd";
import { SiteImage } from "@/components/SiteImage";
import { BlogCard } from "@/components/PageViews";
import { allPostSlugs, getPost, getPostsIndex } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(decodeURIComponent(slug));
  if (!post) return {};
  return seoMetadata({
    title: post.meta.title,
    description: post.meta.description,
    canonical: post.meta.canonical,
    robots: post.meta.robots,
    ogTitle: post.meta.ogTitle,
    ogDescription: post.meta.ogDescription,
    ogImage: post.meta.ogImage,
    ogType: post.meta.ogType || "article",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const post = getPost(decoded);
  if (!post) notFound();
  const recent = getPostsIndex()
    .filter((p) => p.slug !== decoded)
    .slice(0, 3);

  const jsonld = post.jsonld.map((item) => {
    if (!item || typeof item !== "object" || !("author" in item)) return item;
    const { author: _author, ...rest } = item;
    return rest;
  });

  return (
    <article className="page post">
      <JsonLd data={jsonld} />
      <div className="wrap prose post-column">
        <p className="all-posts">
          <Link href="/articles">All Posts</Link>
        </p>
        <nav className="crumbs" aria-label="מיקום">
          <Link href="/">ראשי</Link>
          <span aria-hidden="true"> ‹ </span>
          <span className="crumb-current">Post</span>
        </nav>
        <div className="post-frame">
          <p className="meta-line">
            {post.meta.publishedLabel ? <span>{post.meta.publishedLabel}</span> : null}
            {post.meta.readingTime ? <span>{post.meta.readingTime}</span> : null}
          </p>
          {post.meta.h1.map((text, i) =>
            text.replace(/[\s\u200b]/g, "") ? (
              <h1 key={i}>{text}</h1>
            ) : (
              <h1 key={i}>
                <br />
              </h1>
            ),
          )}
          <MDXRemote source={post.content} components={{ SiteImage }} />
        </div>
        <section className="recent">
          <div className="recent-head">
            <h2>פוסטים אחרונים</h2>
            <Link href="/articles">הצג הכול</Link>
          </div>
          <div className="card-grid recent-grid">
            {recent.map((p) => (
              <BlogCard
                key={p.slug}
                card={{
                  href: p.path,
                  title: (p.h1 || p.title).trim(),
                  excerpt: p.description,
                  read: p.readingTime,
                }}
              />
            ))}
          </div>
        </section>
        <section className="comments">
          <h2>תגובות</h2>
          <div className="comment-box" />
        </section>
      </div>
    </article>
  );
}
