import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BBSidebarNav } from "@/components/bookbreaks/SidebarNav";
import { ThemeTweaker } from "@/components/bookbreaks/ThemeTweaker";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifests/bookbreaks.json",
  appleWebApp: {
    capable: true,
    title: "BookBreaks",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function BookBreaksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tools/bookbreaks/login");
  }

  return (
    <div
      className="min-h-screen flex bg-(--bg) text-(--ink)"
    >
      <BBSidebarNav userEmail={user.email ?? ""} />
      <div className="flex-1 min-w-0 ml-[260px] max-[1024px]:ml-0 flex flex-col relative">
        <main className="flex-1 min-h-screen">{children}</main>
        <ThemeTweaker />
      </div>
      <PwaRegistrar toolId="bookbreaks" />
    </div>
  );
}
