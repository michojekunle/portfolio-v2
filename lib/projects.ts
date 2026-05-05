import { createClient } from "./supabase/client"

export interface Project {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  github_url?: string
  live_url?: string
  stars?: number
  forks?: number
  image_url?: string
  is_featured: boolean
  is_hidden: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data || []
}
