import { createClient } from "@/lib/supabase/server";
import { BooksManager } from "./books-manager";
import { LearningManager } from "./learning-manager";
import { BuildingManager } from "./building-manager";

export default async function AdminNowPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const [{ data: books }, { data: learning }, { data: building }] =
    await Promise.all([
      supabase.from("books").select("*").order("sort_order"),
      supabase.from("learning_items").select("*").order("sort_order"),
      supabase.from("building_projects").select("*").order("sort_order"),
    ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Now</h1>
        <p className="text-sm text-muted-foreground">
          Books, learning progress, and active projects
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium mb-4">Books</h2>
        <BooksManager initialBooks={books ?? []} />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-4">Learning</h2>
        <LearningManager initialItems={learning ?? []} />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-4">Building</h2>
        <BuildingManager initialProjects={building ?? []} />
      </section>
    </div>
  );
}
