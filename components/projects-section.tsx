"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Project {
  title: string
  description: string
  image: string
  tags: string[]
  github: string
  demo: string
}

interface Projects {
  featured: Project[]
  web3: Project[]
  frontend: Project[]
  experiments: Project[]
}

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState("featured")

  const projects: Projects = {
    featured: [
      {
        title: "DeFi Dashboard",
        description:
          "A comprehensive dashboard for tracking DeFi investments across multiple chains with portfolio analytics and yield optimization suggestions.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["Next.js", "TypeScript", "Solidity", "The Graph"],
        github: "#",
        demo: "#",
      },
      {
        title: "NFT Marketplace",
        description:
          "A fully decentralized NFT marketplace with support for multiple chains, featuring royalty enforcement and on-chain verification.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["React", "Solidity", "IPFS", "Ethers.js"],
        github: "#",
        demo: "#",
      },
      {
        title: "Cross-Chain Bridge",
        description:
          "A secure bridge for transferring assets between Ethereum, Arbitrum, and StarkNet with optimized gas fees and transaction batching.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["TypeScript", "Cairo", "Solidity", "ZK Proofs"],
        github: "#",
        demo: "#",
      },
    ],
    web3: [
      {
        title: "Smart Contract Library",
        description:
          "A collection of audited, gas-optimized smart contract templates for common DeFi and NFT use cases.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["Solidity", "Hardhat", "OpenZeppelin"],
        github: "#",
        demo: "#",
      },
      {
        title: "ZK Identity Solution",
        description:
          "Privacy-preserving identity verification system using zero-knowledge proofs for Web3 applications.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["Cairo", "ZK-SNARKs", "TypeScript"],
        github: "#",
        demo: "#",
      },
    ],
    frontend: [
      {
        title: "Component Library",
        description: "A comprehensive React component library with accessibility and performance at its core.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["React", "TypeScript", "Storybook", "Tailwind"],
        github: "#",
        demo: "#",
      },
      {
        title: "Analytics Dashboard",
        description: "Real-time analytics dashboard with customizable widgets and data visualization tools.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["Next.js", "D3.js", "TypeScript"],
        github: "#",
        demo: "#",
      },
    ],
    experiments: [
      {
        title: "Rust CLI Tools",
        description:
          "A collection of command-line utilities built while learning Rust, focusing on performance and safety.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["Rust", "CLI"],
        github: "#",
        demo: "#",
      },
      {
        title: "Functional Programming Exercises",
        description:
          "Solutions to programming challenges implemented in Haskell and Erlang as part of my learning journey.",
        image: "/placeholder.svg?height=300&width=600",
        tags: ["Haskell", "Erlang", "Functional Programming"],
        github: "#",
        demo: "#",
      },
    ],
  }

  return (
    <section id="projects" className="py-20">
      <h2 className="text-3xl font-bold mb-2">Projects</h2>
      <div className="section-rule" />

      <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="web3">Web3</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
        </TabsList>

        {(Object.entries(projects) as [string, Project[]][]).map(([category, projectList]) => (
          <TabsContent key={category} value={category} className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectList.map((project) => (
                <div
                  key={project.title}
                  className="group content-card overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden rounded-md mb-4 bg-muted -mx-6 -mt-6 mb-6">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale opacity-60 transition-opacity duration-300 group-hover:opacity-80"
                    />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {project.github !== "#" ? (
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          <span>Code</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-2" disabled>
                        <Github className="h-4 w-4" />
                        <span>Code</span>
                      </Button>
                    )}
                    {project.demo !== "#" ? (
                      <Button size="sm" className="gap-2" asChild>
                        <Link href={project.demo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span>Live Demo</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-2" disabled>
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Demo</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-12 text-center">
        <Button size="lg" variant="outline" className="gap-2" asChild>
          <Link href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
            <span>View All Projects on GitHub</span>
          </Link>
        </Button>
      </div>
    </section>
  )
}
