"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  github_url: string | null
  demo_url: string | null
  category: string
  stars: number | null
  language: string | null
  image_url: string | null
}

interface ProjectsTabsProps {
  projects: Project[]
}

const TABS = ["featured", "web3", "frontend", "experiments"] as const

export function ProjectsTabs({ projects }: ProjectsTabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState("featured")

  const grouped = TABS.reduce<Record<string, Project[]>>(
    (acc, cat) => {
      acc[cat] = projects.filter((p) => p.category === cat)
      return acc
    },
    { featured: [], web3: [], frontend: [], experiments: [] }
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-8 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="capitalize">
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab} value={tab} className="animate-fade-in">
          {!grouped[tab].length ? (
            <p className="text-sm text-muted-foreground py-6">No projects in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grouped[tab].map((project) => (
                <div key={project.id} className="group content-card overflow-hidden">
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden rounded-md bg-muted -mx-6 -mt-6 mb-6">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover grayscale opacity-60 transition-opacity duration-300 group-hover:opacity-80"
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.language && (
                      <Badge variant="outline" className="text-xs">
                        {project.language}
                      </Badge>
                    )}
                    {project.stars != null && project.stars > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        ★ {project.stars}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {project.github_url ? (
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          Code
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-2" disabled>
                        <Github className="h-4 w-4" />
                        Code
                      </Button>
                    )}
                    {project.demo_url ? (
                      <Button size="sm" className="gap-2" asChild>
                        <Link href={project.demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-2" disabled>
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
