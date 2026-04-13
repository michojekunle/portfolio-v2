import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Eye, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { NewsletterForm } from "./newsletter-form"

export async function BlogSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: rawPosts } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, category, read_time, published_at, views,
      reactions:blog_reactions(count),
      comments:blog_comments(count)
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(4)

  const posts = (rawPosts || []).map(post => ({
    ...post,
    reactionCount: (post.reactions as any)?.[0]?.count ?? 0,
    commentCount: (post.comments as any)?.[0]?.count ?? 0
  }))

  return (
    <section id="blog" className="py-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Blog &amp; Writing</h2>
          <div className="section-rule" />
        </div>
        <Button variant="ghost" size="sm" className="group text-muted-foreground" asChild>
          <Link href="/blog">
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group content-card hover:border-foreground/20 transition-all no-underline flex flex-col h-full"
            >
              <div className="flex-1">
                <Badge
                  variant={post.category === "Technical" ? "default" : post.category === "Web3" ? "secondary" : "outline"}
                  className="mb-4 text-[10px] uppercase tracking-wider h-5 font-bold bg-muted/50 border-border/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                >
                  {post.category}
                </Badge>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-foreground transition-colors leading-snug">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-3">{post.excerpt}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/20">
                <div className="flex items-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <span>
                    {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-foreground transition-all">
                    <Eye className="h-3 w-3" />
                    <span className="text-[10px] font-mono font-bold">{post.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                    <Heart className="h-3 w-3 group-hover:fill-primary/20" />
                    <span className="text-[10px] font-mono font-bold">{post.reactionCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px] font-mono font-bold">{post.commentCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <NewsletterForm />
      </div>
    </section>
  )
}
