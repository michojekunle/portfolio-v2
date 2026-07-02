import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { FwAccount } from "@/lib/flowise/types";
import { FREE_ACCOUNT_LIMIT } from "@/lib/flowise/types";

const CreateSchema = z.object({
  name: z.string().min(1).max(60),
  provider: z.string().max(60).nullable().optional(),
  type: z.enum(["bank", "wallet", "cash", "investment", "credit"]),
  currency: z.enum(["NGN", "USD", "GBP", "EUR", "GHS", "KES"]).default("NGN"),
  starting_balance: z.number().default(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6B7280"),
  icon: z.string().max(4).default("🏦"),
});

const UpdateSchema = CreateSchema.partial().extend({
  id: z.string().uuid(),
  is_archived: z.boolean().optional(),
  // current_balance is intentionally excluded — it is managed exclusively by
  // syncAccountBalance() to keep starting_balance + transactions as source of truth.
});

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("fw_accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flowise/accounts] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }

  return NextResponse.json({ accounts: data ?? [] });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Free plan account limit
  const { count } = await supabase
    .from("fw_accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_archived", false);

  if ((count ?? 0) >= FREE_ACCOUNT_LIMIT) {
    return NextResponse.json(
      { error: `Free plan is limited to ${FREE_ACCOUNT_LIMIT} accounts. Upgrade to add more.` },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { starting_balance, ...rest } = parsed.data;

  const { data, error } = await supabase
    .from("fw_accounts")
    .insert({
      ...rest,
      starting_balance,
      current_balance: starting_balance,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[flowise/accounts] POST error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }

  return NextResponse.json({ account: data as FwAccount }, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { id, ...updates } = parsed.data;

  const { data, error } = await supabase
    .from("fw_accounts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[flowise/accounts] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }

  return NextResponse.json({ account: data as FwAccount });
}
