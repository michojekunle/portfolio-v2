"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Lightbulb, User } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-2">About Me</h2>
        <div className="section-rule" />

        <Tabs defaultValue="developer" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="developer" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Developer</span>
            </TabsTrigger>
            <TabsTrigger value="seeker" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Seeker</span>
            </TabsTrigger>
            <TabsTrigger value="person" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Person</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="developer" className="animate-fade-in">
            <div className="content-card">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  I craft digital experiences at the intersection of frontend elegance and blockchain innovation. With
                  over 4 years of experience in web development, I&apos;ve specialized in building performant, accessible,
                  and beautiful interfaces that bridge the gap between users and complex systems.
                </p>

                <p className="mt-4">
                  My technical journey began with Java into JavaScript and React, evolving into a deep expertise in TypeScript,
                  Next.js, and the modern web ecosystem. As Web3 emerged, I embraced Solidity and smart contract
                  development, fascinated by the potential of decentralized systems to transform our digital landscape.
                </p>

                <p className="mt-4">
                  Currently, I&apos;m expanding my horizons with Rust, Cairo for StarkNet development, and exploring
                  functional programming paradigms through Haskell and Erlang. I believe in continuous learning and
                  pushing the boundaries of what&apos;s possible in both frontend and blockchain technologies.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seeker" className="animate-fade-in">
            <div className="content-card">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  My journey as a developer is inseparable from my spiritual path. I see coding not merely as a
                  profession, but as a creative expression of divine order and purpose. The elegant patterns in
                  well-crafted code reflect the same mathematical beauty found throughout creation.
                </p>

                <p className="mt-4">
                  Faith guides my approach to technology. I believe in building systems that empower rather than
                  exploit, that connect rather than isolate, and that serve humanity&apos;s highest good. This perspective
                  shapes how I select projects and the values I bring to my work.
                </p>

                <p className="mt-4">
                  <em>
                    &ldquo;For we are God&apos;s handiwork, created in Christ Jesus to do good works, which God prepared in advance
                    for us to do.&rdquo;
                  </em>
                  {" "}— This verse reminds me that my technical abilities are gifts to be used purposefully, creating
                  technology that uplifts and serves.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="person" className="animate-fade-in">
            <div className="content-card">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  Beyond code and faith, I&apos;m a lifelong learner with diverse interests. I enjoy philosophical
                  discussions, reading across disciplines, and exploring the connections between technology, theology,
                  and human experience.
                </p>

                <p className="mt-4">
                  Music plays an important role in my life — whether it&apos;s playing guitar, attending worship services, or
                  discovering new artists. I find that music, like code, is a language that speaks to both logic and
                  emotion.
                </p>

                <p className="mt-4">
                  I value community and collaboration, believing that our greatest innovations emerge when we combine
                  diverse perspectives. Whether mentoring junior developers, contributing to open source, or
                  participating in faith communities, I seek to both give and receive wisdom through meaningful
                  connections.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
