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
import { BlogPostClient } from "@/components/blog-post-client";
import { MagneticWrapper } from "@/components/magnetic-wrapper";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    .select("title, excerpt, category, published_at, updated_at, cover_image")
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
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
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
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  // Fetch prev and next posts based on published_at date
  const { data: prevPost } = await supabase
    .from("blog_posts")
    .select("slug, title")
    .eq("published", true)
    .lt("published_at", post.published_at)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: nextPost } = await supabase
    .from("blog_posts")
    .select("slug, title")
    .eq("published", true)
    .gt("published_at", post.published_at)
    .order("published_at", { ascending: true })
    .limit(1)
    .maybeSingle();

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
        image: post.cover_image ? {
          "@type": "ImageObject",
          url: post.cover_image,
        } : {
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

        {/* Post hero with progress bar & animations */}
        <BlogPostClient post={post} slug={slug} />

        {/* Post body */}
        <div className="v3-container flex flex-col xl:flex-row gap-12 xl:gap-20 items-start relative pb-20">
          <article className="v3-post-body flex-1 min-w-0 w-full xl:max-w-[800px]">
            <MarkdownRenderer content={content} />
          </article>
          <TableOfContents content={content} />
        </div>

        {/* Reactions and comments */}
        <section className="v3-container-narrow" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <BlogReactions postId={post.id} />
          <BlogComments postId={post.id} />
        </section>

        {/* Newsletter CTA */}
        <NewsletterCTA 
          title="Liked this? Join the loop." 
          description="Get more engineering field notes and technical deep dives delivered straight to your inbox."
        />

        {/* Prev/next nav */}
        <section className="v3-container border-t border-(--rule)">
          <div className="flex max-[720px]:flex-col justify-between items-center py-20 max-[720px]:py-12 gap-8 max-[720px]:gap-12">
            
            <div className="flex-1 flex justify-start">
              {prevPost && (
                <MagneticWrapper strength={20}>
                  <Link href={`/blog/${prevPost.slug}`} className="group flex flex-col items-start gap-2">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Previous
                    </div>
                    <div className="font-display text-[24px] md:text-[32px] text-(--ink) text-balance leading-tight max-w-[280px]">{prevPost.title}</div>
                  </Link>
                </MagneticWrapper>
              )}
            </div>

            <MagneticWrapper strength={20}>
              <Link href="/blog" className="group flex flex-col items-center gap-2">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1">All notes</div>
                <div className="font-display text-[32px] text-(--ink)">Index</div>
              </Link>
            </MagneticWrapper>
            
            <div className="flex-1 flex justify-end text-right">
              {nextPost && (
                <MagneticWrapper strength={20}>
                  <Link href={`/blog/${nextPost.slug}`} className="group flex flex-col items-end gap-2">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1">
                      Next <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="font-display text-[24px] md:text-[32px] text-(--ink) text-balance leading-tight max-w-[280px]">{nextPost.title}</div>
                  </Link>
                </MagneticWrapper>
              )}
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
