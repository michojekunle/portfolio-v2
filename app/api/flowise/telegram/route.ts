import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractReceipt } from "@/lib/flowise/receipt-extractor";
import { syncAccountBalance } from "@/lib/flowise/balance";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { checkBudgetStatus } from "@/lib/flowise/budget-alerts";

/**
 * Telegram webhook for the Flowise receipt bot.
 *
 * Setup (one time):
 * 1. Create a bot with @BotFather → get TELEGRAM_BOT_TOKEN.
 * 2. Set env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET (any random string).
 * 3. Register the webhook:
 *    curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
 *      -d "url=https://<your-domain>/api/flowise/telegram" \
 *      -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
 *
 * Linking: user generates a code in Flowise → Settings, then sends
 * "/link <code>" to the bot. After that, any photo/screenshot they send is
 * extracted and saved as a transaction on their default account.
 */

interface TgPhotoSize {
  file_id: string;
  file_size?: number;
  width: number;
  height: number;
}

interface TgMessage {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
  photo?: TgPhotoSize[];
  document?: { file_id: string; mime_type?: string; file_size?: number };
}

interface TgUpdate {
  update_id: number;
  message?: TgMessage;
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function tgSend(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.error("[flowise/telegram] sendMessage failed:", err);
  }
}

async function tgDownloadFile(fileId: string): Promise<{ buffer: ArrayBuffer; mime: string } | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  if (!infoRes.ok) return null;
  const info = await infoRes.json() as { ok: boolean; result?: { file_path?: string } };
  const filePath = info.result?.file_path;
  if (!filePath) return null;

  const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  if (!fileRes.ok) return null;

  const buffer = await fileRes.arrayBuffer();
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { buffer, mime };
}

function fmtAmount(amount: number): string {
  return `₦${Math.abs(amount).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Telegram echoes back the secret we registered with setWebhook — reject
  // anything else so random POSTs can't forge updates.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = serviceClient();
  if (!supabase) {
    console.error("[flowise/telegram] Supabase service credentials missing");
    return NextResponse.json({ ok: true }); // ack so Telegram doesn't retry forever
  }

  let update: TgUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = update.message;
  if (!msg || msg.chat.type !== "private") return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();

  // ── Commands ──────────────────────────────────────────────────────────────

  if (text.startsWith("/start")) {
    await tgSend(
      chatId,
      "👋 *Flowise Receipt Bot*\n\nForward me bank alerts, receipts, or transfer screenshots and I'll log them to your Flowise account automatically.\n\nFirst, link your account:\n1. Open Flowise → Settings → Chat Bots\n2. Generate a Telegram link code\n3. Send me: `/link YOUR-CODE`"
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/link")) {
    const code = text.split(/\s+/)[1]?.toLowerCase();
    if (!code) {
      await tgSend(chatId, "Send `/link YOUR-CODE` — generate the code in Flowise → Settings → Chat Bots.");
      return NextResponse.json({ ok: true });
    }

    const { data: link } = await supabase
      .from("fw_bot_links")
      .select("id, user_id, code_expires_at")
      .eq("platform", "telegram")
      .eq("link_code", code)
      .maybeSingle();

    if (!link || (link.code_expires_at && new Date(link.code_expires_at) < new Date())) {
      await tgSend(chatId, "❌ That code is invalid or expired. Generate a fresh one in Flowise → Settings.");
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase
      .from("fw_bot_links")
      .update({
        chat_id: String(chatId),
        link_code: null,
        code_expires_at: null,
        linked_at: new Date().toISOString(),
      })
      .eq("id", link.id);

    if (error) {
      console.error("[flowise/telegram] link update error:", error);
      await tgSend(chatId, "Something went wrong linking your account — please try again.");
    } else {
      await tgSend(chatId, "✅ *Linked!* Send me any receipt, bank alert, or transfer screenshot and I'll log it for you.");
    }
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/unlink")) {
    await supabase
      .from("fw_bot_links")
      .update({ chat_id: null, linked_at: null })
      .eq("platform", "telegram")
      .eq("chat_id", String(chatId));
    await tgSend(chatId, "🔌 Unlinked. Generate a new code in Flowise → Settings to reconnect.");
    return NextResponse.json({ ok: true });
  }

  // ── Everything else requires a linked account ─────────────────────────────

  const { data: link } = await supabase
    .from("fw_bot_links")
    .select("user_id")
    .eq("platform", "telegram")
    .eq("chat_id", String(chatId))
    .maybeSingle();

  if (!link) {
    await tgSend(chatId, "This chat isn't linked yet. Send `/link YOUR-CODE` (get the code in Flowise → Settings → Chat Bots).");
    return NextResponse.json({ ok: true });
  }

  const userId = link.user_id as string;

  // ── Receipt image handling ────────────────────────────────────────────────

  const isImageDoc = msg.document?.mime_type?.startsWith("image/") ?? false;
  const fileId = msg.photo?.length
    ? msg.photo[msg.photo.length - 1].file_id // largest size
    : isImageDoc
      ? msg.document!.file_id
      : null;

  if (!fileId) {
    await tgSend(chatId, "Send me a *photo or screenshot* of a receipt, bank alert, or transfer confirmation and I'll log it. 📸");
    return NextResponse.json({ ok: true });
  }

  const fileSize = msg.photo?.length
    ? msg.photo[msg.photo.length - 1].file_size ?? 0
    : msg.document?.file_size ?? 0;
  if (fileSize > 10 * 1024 * 1024) {
    await tgSend(chatId, "That image is too large — please send something under 10MB.");
    return NextResponse.json({ ok: true });
  }

  // Dedup: same Telegram message delivered twice (webhook retries)
  const importRef = `telegram:${chatId}:${msg.message_id}`;
  const { data: dupe } = await supabase
    .from("fw_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("raw_import_ref", importRef)
    .maybeSingle();
  if (dupe) return NextResponse.json({ ok: true });

  try {
    const file = await tgDownloadFile(fileId);
    if (!file) {
      await tgSend(chatId, "I couldn't download that image from Telegram — please try sending it again.");
      return NextResponse.json({ ok: true });
    }

    const extracted = await extractReceipt(file.buffer, file.mime);
    if (!extracted || extracted.amount === null) {
      await tgSend(chatId, "🤔 I couldn't read a transaction from that image. Try a clearer shot of the receipt or alert.");
      return NextResponse.json({ ok: true });
    }

    // Default account: first non-archived account
    const { data: account } = await supabase
      .from("fw_accounts")
      .select("id, name, currency")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!account) {
      await tgSend(chatId, "You don't have any account in Flowise yet — create one in the app first, then resend the receipt.");
      return NextResponse.json({ ok: true });
    }

    const date = extracted.date ?? new Date().toISOString().slice(0, 10);
    const description = extracted.description ?? (msg.caption?.slice(0, 100) || "Receipt via Telegram");

    const { error: insertError } = await supabase.from("fw_transactions").insert({
      user_id: userId,
      account_id: account.id,
      amount: extracted.amount,
      category_id: extracted.category_id,
      date,
      description,
      note: msg.caption ?? null,
      tags: ["telegram"],
      is_recurring: false,
      source: "ai_scan",
      raw_import_ref: importRef,
    });

    if (insertError) {
      console.error("[flowise/telegram] insert error:", insertError);
      await tgSend(chatId, "I read the receipt but couldn't save it — please try again in a moment.");
      return NextResponse.json({ ok: true });
    }

    try {
      // Service-role client bypasses RLS; sync helper filters by user_id itself
      await syncAccountBalance(supabase, account.id as string, userId);
    } catch (syncErr) {
      console.error("[flowise/telegram] balance sync failed (tx saved):", syncErr);
    }

    const categoryName = extracted.category_id
      ? SYSTEM_CATEGORIES.find((c) => c.id === extracted.category_id)?.name ?? "Uncategorised"
      : "Uncategorised";
    const kind = extracted.amount > 0 ? "💰 Income" : "💸 Expense";

    let budgetAlert = "";
    if (extracted.category_id && extracted.amount < 0) {
      try {
        budgetAlert = await checkBudgetStatus(
          supabase,
          userId,
          extracted.category_id,
          date,
          account.currency as string
        );
      } catch (budgetErr) {
        console.error("[flowise/telegram] budget status fetch failed:", budgetErr);
      }
    }

    await tgSend(
      chatId,
      `${kind} logged ✅\n\n*${fmtAmount(extracted.amount)}* — ${description}\n📁 ${categoryName}\n📅 ${date}\n🏦 ${account.name}${budgetAlert}\n\n_Wrong details? Edit it in Flowise → Transactions._`
    );
  } catch (err) {
    console.error("[flowise/telegram] processing error:", err);
    await tgSend(chatId, "Something went wrong reading that receipt — please try again.");
  }

  return NextResponse.json({ ok: true });
}
