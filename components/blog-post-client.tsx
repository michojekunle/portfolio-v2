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
        className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--v3-accent)] z-[500] origin-left" 
        style={{ scaleX }} 
      />
      <section className="v3-post-hero v3-container-narrow pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="crumbs font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase mb-[32px] flex gap-[8px]" 
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[var(--ink)] transition-colors">Home</Link>
          <span className="text-[var(--rule)]">/</span>
          <Link href="/blog" className="hover:text-[var(--ink)] transition-colors">Notes</Link>
          {post.category && (
            <>
              <span className="text-[var(--rule)]">/</span>
              <span className="text-[var(--ink)]">{post.category}</span>
            </>
          )}
        </motion.div>

        <h1 className="m-0 font-display font-light text-[clamp(48px,8vw,100px)] leading-[0.9] tracking-[-0.03em] text-[var(--ink)] mb-[32px] text-balance fvs-display flex flex-wrap gap-x-[16px] gap-y-[8px] max-[720px]:gap-x-[10px]">
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
            className="lede text-[20px] text-[var(--ink-2)] max-w-[56ch] leading-[1.65] m-0 mb-[48px]"
          >
            {post.excerpt}
          </motion.p>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="meta-line flex flex-wrap gap-[24px] items-center pt-[24px] border-t border-[var(--rule)] font-mono text-[11px] tracking-[0.08em] text-[var(--ink-3)] uppercase"
        >
          {post.category && <span className="px-[10px] py-[4px] border border-[var(--rule)] rounded-full text-[var(--ink-2)]">{post.category}</span>}
          {post.published_at && (
            <span className="text-[var(--ink)] font-medium">
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
