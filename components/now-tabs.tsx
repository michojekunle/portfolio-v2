"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Book, Code, GraduationCap } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface BookItem {
  id: string
  title: string
  author: string
  progress: number
  status: string
  notes: string | null
}

interface LearningItem {
  id: string
  name: string
  progress: number
  description: string | null
}

interface BuildingProject {
  id: string
  name: string
  description: string | null
  status: string
  notes: string | null
  github_url: string | null
}

interface NowTabsProps {
  books: BookItem[]
  learning: LearningItem[]
  building: BuildingProject[]
}

export function NowTabs({ books, learning, building }: NowTabsProps): React.ReactElement {
  return (
    <Tabs defaultValue="learning" className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="learning" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span>Learning</span>
        </TabsTrigger>
        <TabsTrigger value="reading" className="flex items-center gap-2">
          <Book className="h-4 w-4" />
          <span>Reading</span>
        </TabsTrigger>
        <TabsTrigger value="building" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span>Building</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="learning" className="animate-fade-in">
        <div className="content-card">
          {!learning.length ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="space-y-6">
              {learning.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="reading" className="animate-fade-in">
        <div className="content-card">
          {!books.length ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="space-y-8">
              {books.map((book) => (
                <div key={book.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                    </div>
                    <Badge
                      variant={
                        book.status === "reading"
                          ? "default"
                          : book.status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0 capitalize"
                    >
                      {book.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={book.progress} className="h-1.5 flex-1" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {book.progress}%
                    </span>
                  </div>
                  {book.notes && (
                    <div className="mt-2 pt-2 border-t border-border/60 prose dark:prose-invert prose-sm max-w-none text-muted-foreground prose-p:leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {book.notes}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="building" className="animate-fade-in">
        <div className="content-card">
          {!building.length ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="space-y-8">
              {building.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{project.name}</h4>
                    <Badge
                      variant={
                        project.status === "In Progress"
                          ? "default"
                          : project.status === "Shipped"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  {project.notes && (
                    <div className="mt-2 pt-2 border-t border-border/60 prose dark:prose-invert prose-sm max-w-none text-muted-foreground prose-p:leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {project.notes}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
