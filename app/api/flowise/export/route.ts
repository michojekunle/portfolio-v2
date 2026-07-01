import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to params required (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data: txRows, error } = await supabase
    .from("fw_transactions")
    .select("*, account:fw_accounts(name, currency)")
    .eq("user_id", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flowise/export] error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }

  const catMap: Record<string, string> = {};
  for (const c of SYSTEM_CATEGORIES) catMap[c.id] = c.name;

  const rows = txRows ?? [];
  const header = ["Date", "Description", "Amount", "Type", "Category", "Account", "Currency", "Note", "Tags"];

  const lines = [header.join(",")];
  for (const tx of rows) {
    const amount = tx.amount as number;
    const account = tx.account as { name: string; currency: string } | null;
    const catId = tx.category_id as string | null;
    const row = [
      tx.date as string,
      `"${((tx.description as string) ?? "").replace(/"/g, '""')}"`,
      amount.toFixed(2),
      amount > 0 ? "Income" : "Expense",
      catId ? (catMap[catId] ?? catId) : "Uncategorized",
      `"${account?.name ?? ""}"`,
      account?.currency ?? "NGN",
      `"${((tx.note as string | null) ?? "").replace(/"/g, '""')}"`,
      `"${((tx.tags as string[]) ?? []).join("; ")}"`,
    ];
    lines.push(row.join(","));
  }

  const csv = lines.join("\n");
  const filename = `flowise-export-${from}-to-${to}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
