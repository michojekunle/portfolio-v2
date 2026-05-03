import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { FilmReelSection } from "@/components/film-reel-section"
import { GitHubBentoSection } from "@/components/github-bento-section"
import { NowSection } from "@/components/now-section"
import { BlogSection } from "@/components/blog-section"

export default function Home(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <HeroSection />

      <div className="v3-section-divider-band" aria-hidden="true" />

      <ProjectsSection />

      <div className="v3-section-divider-band" aria-hidden="true" />

      <FilmReelSection />

      <div className="v3-section-divider" aria-hidden="true" />

      <GitHubBentoSection />

      <div className="v3-section-divider" aria-hidden="true" />

      <NowSection />

      <div className="v3-section-divider" aria-hidden="true" />

      <BlogSection />
    </main>
  )
}
