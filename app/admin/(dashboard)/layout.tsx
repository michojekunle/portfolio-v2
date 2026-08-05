import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "./admin-nav";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.CONTACT_TO_EMAIL || "info@michaelojekunle.dev";

  if (!user || user.email !== adminEmail) {
    redirect("/admin/login");
  }

  const { count: unreadMessageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav userEmail={user?.email ?? ""} unreadMessageCount={unreadMessageCount ?? 0} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
