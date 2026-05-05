import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";
import { ViewCounter } from "@/components/view-counter";
import { TableOfContents } from "@/components/table-of-contents";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { BlogReactions } from "@/components/blog-reactions";
import { BlogComments } from "@/components/blog-comments";
import { NewsletterCTA } from "@/components/newsletter-cta";

export const revalidate = 60;

const SITE = "https://michaelojekunle.dev";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  // Can't use cookies() at build time — use anon client directly.
  const { createClient: createAnonClient } = await import("@supabase/supabase-js");
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, category, published_at, updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Post not found" };

  const postUrl = `${SITE}/blog/${slug}`;

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: postUrl },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: postUrl,
      type: "article",
      siteName: "Michael Ojekunle",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: ["https://michaelojekunle.dev"],
      tags: post.category ? [post.category] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      creator: "@devvmichael",
    },
  };
}

export default async function BlogPostPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select(`
      *,
      reactions:blog_reactions(count),
      comments:blog_comments(count)
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const reactionCount = (post.reactions as any)?.[0]?.count ?? 0;
  const commentCount = (post.comments as any)?.[0]?.count ?? 0;

  const postUrl = `${SITE}/blog/${slug}`;
  const content = (post.content as string) ?? "";

  // Article structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt ?? undefined,
        url: postUrl,
        datePublished: post.published_at ?? undefined,
        dateModified: post.updated_at ?? undefined,
        author: {
          "@type": "Person",
          "@id": `${SITE}/#person`,
          name: "Michael Ojekunle",
          url: SITE,
        },
        publisher: {
          "@type": "Person",
          "@id": `${SITE}/#person`,
          name: "Michael Ojekunle",
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
        articleSection: post.category ?? undefined,
        image: {
          "@type": "ImageObject",
          url: `${SITE}/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Notes", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title },
        ],
      },
    ],
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Post hero */}
        <section className="v3-post-hero v3-container-narrow">
          <div className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {" / "}
            <Link href="/blog">Notes</Link>
            {" / "}
            <span>{post.category}</span>
          </div>
          <div className="meta-line">
            {post.category && <span className="tag">{post.category}</span>}
            {post.published_at && (
              <span>
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at as string), "MMMM d, yyyy")}
                </time>
              </span>
            )}
            {post.read_time && <span>{post.read_time}</span>}
            <ViewCounter slug={slug} increment />
          </div>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="lede">{post.excerpt}</p>}
        </section>

        {/* Post body */}
        <article className="v3-post-body v3-container-narrow">
          <TableOfContents content={content} />
          <MarkdownRenderer content={content} />
        </article>

        {/* Newsletter CTA */}
        <NewsletterCTA 
          title="Liked this? Join the loop." 
          description="Get more engineering field notes and technical deep dives delivered straight to your inbox."
        />

        {/* Reactions and comments */}
        <section className="v3-container-narrow" style={{ paddingBottom: 80 }}>
          <BlogReactions postId={post.id} />
          <BlogComments postId={post.id} />
        </section>

        {/* Prev/next nav */}
        <section className="v3-container">
          <div className="v3-case-next">
            <Link href="/blog">
              <div className="lbl">← All notes</div>
              <div className="nm">Index</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
