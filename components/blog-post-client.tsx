"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { format } from "date-fns"
import Link from "next/link"
import { ViewCounter } from "./view-counter"

interface BlogPostClientProps {
  post: {
    title: string
    excerpt: string | null
    category: string | null
    published_at: string | null
    read_time: string | null
  }
  slug: string
}

export function BlogPostClient({ post, slug }: BlogPostClientProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const titleWords = post.title.split(" ")

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-0.75 bg-(--v3-accent) z-[500] origin-left" 
        style={{ scaleX }} 
      />
      <section className="v3-post-hero v3-container-narrow pt-40 pb-20 max-[720px]:pt-20 max-[720px]:pb-14 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="crumbs font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-8 flex gap-2" 
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-(--ink) transition-colors">Home</Link>
          <span className="text-(--rule)">/</span>
          <Link href="/blog" className="hover:text-(--ink) transition-colors">Notes</Link>
          {post.category && (
            <>
              <span className="text-(--rule)">/</span>
              <span className="text-(--ink)">{post.category}</span>
            </>
          )}
        </motion.div>

        <h1 className="m-0 font-display font-light text-[clamp(48px,8vw,100px)] leading-[0.9] tracking-[-0.03em] text-(--ink) mb-8 text-balance fvs-display flex flex-wrap gap-x-4 gap-y-2 max-[720px]:gap-x-2.5">
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {post.excerpt && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lede text-[20px] text-secondary-foreground max-w-[56ch] leading-[1.65] m-0 mb-12"
          >
            {post.excerpt}
          </motion.p>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="meta-line flex flex-wrap gap-6 items-center pt-6 border-t border-(--rule) font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase"
        >
          {post.category && <span className="px-2.5 py-1 border border-(--rule) rounded-full text-secondary-foreground">{post.category}</span>}
          {post.published_at && (
            <span className="text-(--ink) font-medium">
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at as string), "MMMM d, yyyy")}
              </time>
            </span>
          )}
          {post.read_time && <span>{post.read_time}</span>}
          <div className="flex-1" />
          <ViewCounter slug={slug} increment />
        </motion.div>
      </section>
    </>
  )
}
