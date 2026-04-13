"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Lightbulb, User } from "lucide-react";
// import { PlayfulAvatar } from "./playful-avatar";

export function AboutSection() {
  return (
    <section id="about" className="py-20">
      {/* <div className="max-w-5xl mx-auto"> */}
      <h2 className="text-3xl font-bold mb-2">About Me</h2>
      <div className="section-rule mb-10" />

      {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-16">
          <div className="md:col-span-2 flex justify-center md:sticky md:top-24 h-max">
            <PlayfulAvatar />
          </div> */}

      <div className="md:col-span-3">
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
                  I build digital products that bridge the gap between complex
                  backend systems and everyday users. With over 4 years of
                  experience, my focus is on engineering performant, accessible,
                  and intuitive frontends.
                </p>

                <p className="mt-4">
                  My technical journey started with Java before transitioning
                  into JavaScript and React. Today, I work extensively with
                  TypeScript and Next.js. As Web3 matured, I expanded into
                  Solidity and smart contract development to build robust
                  decentralized architectures.
                </p>

                <p className="mt-4">
                  My current professional goal is to build practical, real-world
                  solutions while expanding my frontend engineering skills. I am
                  actively studying <strong>Zero-Knowledge proofs</strong> and{" "}
                  <strong>Machine Learning (ZKML)</strong>, with a focus on
                  networks like, <strong>Starknet</strong>,{" "}
                  <strong>Rootstock</strong>, <strong>Stacks</strong>, and{" "}
                  <strong>Ethereum</strong>.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seeker" className="animate-fade-in">
            <div className="content-card">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  My work as a developer is tied closely to my faith. I view
                  software engineering not just as a career, but as an
                  opportunity to build systems that are orderly, purposeful, and
                  genuinely helpful to others. My core philosophy for mastering
                  these systems is learning them from first principles.
                </p>

                <p className="mt-4">
                  This approach dictates what I build. I am currently developing{" "}
                  <strong>Zamir</strong>, an AI-driven orchestration
                  application, and <strong>FirstCode Forge</strong>. To
                  strengthen my underlying architectural knowledge, I am also
                  learning <em>Flutter</em>. By stripping away abstractions, I
                  aim to understand exactly how tools work under the hood rather
                  than just knowing how to use them.
                </p>

                <p className="mt-4">
                  <em>
                    &ldquo;For we are God&apos;s handiwork, created in Christ
                    Jesus to do good works, which God prepared in advance for us
                    to do.&rdquo;
                  </em>{" "}
                  — This verse serves as a personal reminder to approach my
                  technical work with intention, ensuring that what I build has
                  a positive and useful impact.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="person" className="animate-fade-in">
            <div className="content-card">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  Outside of software development, I strive to maintain a broad
                  set of interests to stay well-rounded. Currently, I am
                  learning to play the <strong>guitar</strong>, studying{" "}
                  <strong>chess</strong> strategy, and practicing new languages:
                  <strong> French, Spanish, and Chinese</strong>.
                </p>

                <p className="mt-4">
                  I also read extensively across different fields—particularly{" "}
                  <em>
                    Economics, Arts, Business, Finance, Agriculture, Psychology,
                    Communication, and Leadership
                  </em>
                  . I find that concepts from one discipline often solve
                  problems in another, and I value the unique perspectives that
                  come from connecting with people across different industries.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* </div> */}
        {/* </div> */}
      </div>
    </section>
  );
}
