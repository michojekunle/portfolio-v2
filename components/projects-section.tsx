import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ProjectsTabs } from "./projects-tabs"

export async function ProjectsSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_hidden", false)
    .order("sort_order", { ascending: true })

  const latestUpdatedAt = projects?.reduce<Date | null>((latest, p) => {
    const d = new Date(p.updated_at as string)
    return latest === null || d > latest ? d : latest
  }, null)

  return (
    <section id="projects" className="py-20">
      <h2 className="text-3xl font-bold mb-2">Projects</h2>
      <div className="section-rule" />
      {latestUpdatedAt && (
        <p className="text-xs text-muted-foreground mb-6">
          Last updated {formatDistanceToNow(latestUpdatedAt)} ago
        </p>
      )}

      <ProjectsTabs projects={projects ?? []} />

      <div className="mt-12 text-center">
        <Button size="lg" variant="outline" className="gap-2" asChild>
          <Link href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
            View All Projects on GitHub
          </Link>
        </Button>
      </div>
    </section>
  )
}
