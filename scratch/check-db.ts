import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
  const { error: commentsError } = await supabase.from("blog_comments").select("*").limit(1);
  const { error: reactionsError } = await supabase.from("blog_reactions").select("*").limit(1);

  console.log("Comments Table:", commentsError ? "Not found or error: " + commentsError.message : "Exists");
  console.log("Reactions Table:", reactionsError ? "Not found or error: " + reactionsError.message : "Exists");
}

checkTables();
