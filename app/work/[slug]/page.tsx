import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getCaseStudy, CASE_STUDIES } from "@/lib/case-studies"
import { CaseStudyClient } from "@/components/case-study-client"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return CASE_STUDIES.map((cs) => ({ slug: cs.slug }))
}

const SITE = "https://michaelojekunle.dev"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cs = getCaseStudy(slug)
  if (!cs) return { title: "Project not found" }

  const url = `${SITE}/work/${slug}`
  const ogImageUrl = `${SITE}/work/${slug}/opengraph-image`

  return {
    title: `${cs.name} Case Study`,
    description: cs.desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${cs.name} Case Study — Michael Ojekunle`,
      description: cs.desc,
      url,
      type: "website",
      siteName: "Michael Ojekunle",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${cs.name} Case Study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cs.name} Case Study — Michael Ojekunle`,
      description: cs.desc,
      images: [ogImageUrl],
      creator: "@devvmichael",
    },
  }
}

export default async function CaseStudyPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params
  const p = getCaseStudy(slug)
  if (!p) notFound()

  const currentIndex = CASE_STUDIES.findIndex((cs) => cs.slug === slug)
  const prevProject =
    currentIndex > 0
      ? CASE_STUDIES[currentIndex - 1]
      : CASE_STUDIES[CASE_STUDIES.length - 1]
  const nextProject =
    currentIndex < CASE_STUDIES.length - 1
      ? CASE_STUDIES[currentIndex + 1]
      : CASE_STUDIES[0]

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <CaseStudyClient 
        p={p} 
        prevProject={prevProject ? { slug: prevProject.slug, name: prevProject.name } : null}
        nextProject={nextProject ? { slug: nextProject.slug, name: nextProject.name } : null} 
      />
    </main>
  )
}
