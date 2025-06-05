"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Book, Code, GraduationCap, Lightbulb } from "lucide-react"

export function NowSection() {
  const [activeTab, setActiveTab] = useState("learning")

  const learningProgress = [
    { name: "Rust", progress: 65, description: "Building CLI tools and exploring systems programming" },
    { name: "Cairo", progress: 40, description: "Learning StarkNet development and ZK applications" },
    { name: "Haskell", progress: 25, description: "Exploring functional programming paradigms" },
    { name: "Erlang", progress: 15, description: "Understanding concurrent programming models" },
  ]

  const currentBooks = [
    { title: "Grokking Algorithms", author: "Aditya Bhargava", progress: 80 },
    { title: "Zero to One", author: "Peter Thiel", progress: 60 },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", progress: 45 },
    { title: "Mere Christianity", author: "C.S. Lewis", progress: 90 },
  ]

  const currentProjects = [
    {
      name: "Personal Knowledge Base",
      description: "Building a second brain with linked notes and AI integration",
      status: "In Progress",
    },
    {
      name: "ZK Identity Protocol",
      description: "Researching and prototyping privacy-preserving identity verification",
      status: "Research Phase",
    },
    {
      name: "Rust CLI Toolkit",
      description: "Collection of productivity tools built while learning Rust",
      status: "Active Development",
    },
  ]

  return (
    <section id="now" className="py-10">
      <h2 className="text-3xl font-bold mb-2">Now</h2>
      <div className="h-1 w-20 bg-primary mb-8"></div>
      <p className="text-muted-foreground mb-6">
        What I'm currently focused on, learning, and exploring. Updated weekly.
      </p>

      <Tabs defaultValue="learning" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <div className="terminal-card">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-500"></div>
              <div className="terminal-dot bg-yellow-500 ml-1"></div>
              <div className="terminal-dot bg-green-500 ml-1"></div>
              <div className="ml-2 text-xs text-muted-foreground">learning-dashboard.md</div>
            </div>

            <div className="space-y-6">
              {learningProgress.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span>Learning Focus</span>
              </h4>
              <p className="text-sm text-muted-foreground">
                Currently focusing on systems programming with Rust and zero-knowledge cryptography. My goal is to build
                more efficient and privacy-preserving applications that combine traditional web technologies with
                blockchain capabilities.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reading" className="animate-fade-in">
          <div className="terminal-card">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-500"></div>
              <div className="terminal-dot bg-yellow-500 ml-1"></div>
              <div className="terminal-dot bg-green-500 ml-1"></div>
              <div className="ml-2 text-xs text-muted-foreground">bookshelf.md</div>
            </div>

            <div className="space-y-6">
              {currentBooks.map((book) => (
                <div key={book.title} className="space-y-2">
                  <div>
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={book.progress} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{book.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Book className="h-4 w-4 text-primary" />
                <span>Reading Queue</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "Designing Data-Intensive Applications" by Martin Kleppmann</li>
                <li>• "The Soul of a New Machine" by Tracy Kidder</li>
                <li>• "The Practice of the Presence of God" by Brother Lawrence</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="building" className="animate-fade-in">
          <div className="terminal-card">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-500"></div>
              <div className="terminal-dot bg-yellow-500 ml-1"></div>
              <div className="terminal-dot bg-green-500 ml-1"></div>
              <div className="ml-2 text-xs text-muted-foreground">projects.md</div>
            </div>

            <div className="space-y-6">
              {currentProjects.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{project.name}</h4>
                    <Badge
                      variant={
                        project.status === "In Progress"
                          ? "default"
                          : project.status === "Research Phase"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <span>Latest Commit</span>
              </h4>
              <div className="code-block">
                <pre className="text-xs">
                  <code>
                    {`feat(identity): implement basic ZK proof generation
commit 8f7e21a9 • 2 days ago
                    
- Add circom circuits for identity verification
- Implement proof generation in TypeScript
- Update documentation with usage examples`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
