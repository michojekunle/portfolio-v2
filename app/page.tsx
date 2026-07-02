import { HeroSection } from "@/components/hero-section"
import { AboutPreviewSection } from "@/components/about-preview-section"
import { ProjectsSection } from "@/components/projects-section"
import { CreatorSuiteSection } from "@/components/creator-suite-section"
import { GitHubBentoSection } from "@/components/github-bento-section"
import { NowSection } from "@/components/now-section"
import { BlogSection } from "@/components/blog-section"

export default function Home(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <HeroSection />

      <AboutPreviewSection />

      <div className="h-[4px] bg-[linear-gradient(90deg,transparent_0%,var(--v3-accent-soft)_20%,var(--v3-accent)_50%,var(--v3-accent-soft)_80%,transparent_100%)] opacity-60" aria-hidden="true" />

      <ProjectsSection />

      <div className="h-[1px] bg-[linear-gradient(90deg,transparent_0%,var(--rule)_20%,var(--v3-accent)_50%,var(--rule)_80%,transparent_100%)]" aria-hidden="true" />

      <CreatorSuiteSection />

      <div className="h-[4px] bg-[linear-gradient(90deg,transparent_0%,var(--v3-accent-soft)_20%,var(--v3-accent)_50%,var(--v3-accent-soft)_80%,transparent_100%)] opacity-60" aria-hidden="true" />

      <div className="h-[1px] bg-[linear-gradient(90deg,transparent_0%,var(--rule)_20%,var(--v3-accent)_50%,var(--rule)_80%,transparent_100%)]" aria-hidden="true" />

      <GitHubBentoSection />

      <div className="h-[1px] bg-[linear-gradient(90deg,transparent_0%,var(--rule)_20%,var(--v3-accent)_50%,var(--rule)_80%,transparent_100%)]" aria-hidden="true" />

      <NowSection />

      <div className="h-[1px] bg-[linear-gradient(90deg,transparent_0%,var(--rule)_20%,var(--v3-accent)_50%,var(--rule)_80%,transparent_100%)]" aria-hidden="true" />

      <BlogSection />
    </main>
  )
}
