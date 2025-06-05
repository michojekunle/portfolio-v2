import { Navbar } from "@/components/navbar"
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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 relative overflow-hidden">
      <div className="celestial-gradient"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Navbar />
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
