import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ProjectsSection } from "@/components/projects-section"
import { BlogSection } from "@/components/blog-section"
import { NowSection } from "@/components/now-section"
import { VerseWidget } from "@/components/verse-widget"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background outline-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <BlogSection />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
          <div className="md:col-span-2">
            <NowSection />
          </div>
          <div>
            <VerseWidget />
          </div>
        </div>
        <ContactSection />
        <Footer />
      </div>
    </main>
  )
}
