import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Metadata } from "next";

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
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const postUrl = `${SITE}/blog/${slug}`;

  // Article structured data
  const jsonLd = {
    "@context": "https://schema.org",
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
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen pt-24 pb-20 px-6 max-w-2xl mx-auto outline-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        All posts
      </Link>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            {post.category && (
              <Badge variant="secondary">
                <span className="sr-only">Category: </span>
                {post.category}
              </Badge>
            )}
            {post.read_time && (
              <span className="text-xs text-muted-foreground" aria-label={`${post.read_time} read`}>
                {post.read_time}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">{post.title}</h1>
          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
          )}
          {post.published_at && (
            <time
              dateTime={post.published_at}
              className="block text-xs text-muted-foreground mt-3"
            >
              {format(new Date(post.published_at as string), "MMMM d, yyyy")}
            </time>
          )}
        </header>

        <div className="prose dark:prose-invert max-w-none prose-sm prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4 prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content ?? ""}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
