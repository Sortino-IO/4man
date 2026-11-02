import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { JsonLd } from "@/components/JsonLd";
import { SiteImage } from "@/components/SiteImage";
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
  const share = encodeURIComponent(post.meta.canonical || `https://www.4man.co.il/post/${decoded}`);

  return (
    <article className="page post">
      <JsonLd data={post.jsonld} />
      <div className="wrap prose post-column">
        <nav className="crumbs" aria-label="מיקום">
          <Link href="/">ראשי</Link>
          <span aria-hidden="true"> ‹ </span>
          <Link href="/articles">All Posts</Link>
        </nav>
        {post.meta.h1.map((text, i) =>
          text.replace(/[\s\u200b]/g, "") ? (
            <h1 key={i}>{text}</h1>
          ) : (
            <h1 key={i}>
              <br />
            </h1>
          ),
        )}
        <p className="meta-line">
          {post.meta.publishedLabel ? <span>{post.meta.publishedLabel}</span> : null}
          {post.meta.readingTime ? <span>{post.meta.readingTime}</span> : null}
          {post.meta.author ? (
            post.meta.authorUrl ? (
              <Link href={post.meta.authorUrl}>{post.meta.author}</Link>
            ) : (
              <span>{post.meta.author}</span>
            )
          ) : null}
        </p>
        <MDXRemote source={post.content} components={{ SiteImage }} />
        <div className="share">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${share}`} target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
        <section className="recent">
          <h2>פוסטים אחרונים</h2>
          <Link href="/articles">הצג הכול</Link>
          <ul>
            {recent.map((p) => (
              <li key={p.slug}>
                <Link href={p.path}>{p.h1 || p.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
