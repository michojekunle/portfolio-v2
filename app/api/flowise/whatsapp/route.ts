import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import { extractReceipt } from "@/lib/flowise/receipt-extractor";
import { syncAccountBalance } from "@/lib/flowise/balance";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";

/**
 * WhatsApp Cloud API webhook for the Flowise receipt bot.
 *
 * Setup (Meta for Developers):
 * 1. Create a Meta app → add the WhatsApp product → get a phone number.
 * 2. Set env:
 *    WHATSAPP_VERIFY_TOKEN   — any random string, echoed during verification
 *    WHATSAPP_ACCESS_TOKEN   — permanent system-user token
 *    WHATSAPP_PHONE_NUMBER_ID — the sending phone number id
 *    WHATSAPP_APP_SECRET     — app secret, used to verify webhook signatures
 * 3. Configure the webhook URL as https://<domain>/api/flowise/whatsapp and
 *    subscribe to the "messages" field.
 *
 * Linking: user generates a code in Flowise → Settings → Chat Bots, then
 * WhatsApps "link <code>" to the bot number.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

interface WaMessage {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function waSend(to: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return;
  try {
    await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
  } catch (err) {
    console.error("[flowise/whatsapp] send failed:", err);
  }
}

async function waDownloadMedia(mediaId: string): Promise<{ buffer: ArrayBuffer; mime: string } | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return null;

  const metaRes = await fetch(`${GRAPH}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) return null;
  const meta = await metaRes.json() as { url?: string; mime_type?: string };
  if (!meta.url) return null;

  const fileRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  if (!fileRes.ok) return null;

  return { buffer: await fileRes.arrayBuffer(), mime: meta.mime_type ?? "image/jpeg" };
}

function fmtAmount(amount: number): string {
  return `₦${Math.abs(amount).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

/** Meta webhook verification handshake */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const rawBody = await request.text();

  // Verify Meta's HMAC signature so forged webhooks are rejected
  if (appSecret) {
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  } else {
    // Without the app secret we cannot authenticate the caller — refuse to
    // process rather than accept unauthenticated financial data.
    console.error("[flowise/whatsapp] WHATSAPP_APP_SECRET not set — rejecting webhook");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = serviceClient();
  if (!supabase) {
    console.error("[flowise/whatsapp] Supabase service credentials missing");
    return NextResponse.json({ ok: true });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Meta nests messages deep: entry[].changes[].value.messages[]
  const messages: WaMessage[] = [];
  const entries = (payload as { entry?: { changes?: { value?: { messages?: WaMessage[] } }[] }[] }).entry ?? [];
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      for (const m of change.value?.messages ?? []) messages.push(m);
    }
  }

  for (const msg of messages) {
    const from = msg.from;

    if (msg.type === "text") {
      const text = (msg.text?.body ?? "").trim().toLowerCase();
      const linkMatch = text.match(/^\/?link\s+([a-f0-9]{8})$/);

      if (linkMatch) {
        const code = linkMatch[1];
        const { data: link } = await supabase
          .from("fw_bot_links")
          .select("id, code_expires_at")
          .eq("platform", "whatsapp")
          .eq("link_code", code)
          .maybeSingle();

        if (!link || (link.code_expires_at && new Date(link.code_expires_at) < new Date())) {
          await waSend(from, "❌ That code is invalid or expired. Generate a fresh one in Flowise → Settings → Chat Bots.");
          continue;
        }

        const { error } = await supabase
          .from("fw_bot_links")
          .update({
            chat_id: from,
            link_code: null,
            code_expires_at: null,
            linked_at: new Date().toISOString(),
          })
          .eq("id", link.id);

        await waSend(
          from,
          error
            ? "Something went wrong linking your account — please try again."
            : "✅ Linked! Send me any receipt, bank alert, or transfer screenshot and I'll log it to Flowise for you."
        );
        continue;
      }

      await waSend(from, "👋 Flowise Receipt Bot. Send a photo of a receipt or bank alert to log it.\n\nNot linked yet? Get a code in Flowise → Settings → Chat Bots, then send: link YOUR-CODE");
      continue;
    }

    if (msg.type !== "image" || !msg.image) continue;

    const { data: link } = await supabase
      .from("fw_bot_links")
      .select("user_id")
      .eq("platform", "whatsapp")
      .eq("chat_id", from)
      .maybeSingle();

    if (!link) {
      await waSend(from, "This number isn't linked yet. Get a code in Flowise → Settings → Chat Bots, then send: link YOUR-CODE");
      continue;
    }

    const userId = link.user_id as string;
    const importRef = `whatsapp:${from}:${msg.id}`;

    const { data: dupe } = await supabase
      .from("fw_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("raw_import_ref", importRef)
      .maybeSingle();
    if (dupe) continue;

    try {
      const file = await waDownloadMedia(msg.image.id);
      if (!file) {
        await waSend(from, "I couldn't download that image — please try sending it again.");
        continue;
      }

      const extracted = await extractReceipt(file.buffer, file.mime);
      if (!extracted || extracted.amount === null) {
        await waSend(from, "🤔 I couldn't read a transaction from that image. Try a clearer shot of the receipt or alert.");
        continue;
      }

      const { data: account } = await supabase
        .from("fw_accounts")
        .select("id, name")
        .eq("user_id", userId)
        .eq("is_archived", false)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!account) {
        await waSend(from, "You don't have any account in Flowise yet — create one in the app first, then resend the receipt.");
        continue;
      }

      const date = extracted.date ?? new Date().toISOString().slice(0, 10);
      const description = extracted.description ?? (msg.image.caption?.slice(0, 100) || "Receipt via WhatsApp");

      const { error: insertError } = await supabase.from("fw_transactions").insert({
        user_id: userId,
        account_id: account.id,
        amount: extracted.amount,
        category_id: extracted.category_id,
        date,
        description,
        note: msg.image.caption ?? null,
        tags: ["whatsapp"],
        is_recurring: false,
        source: "ai_scan",
        raw_import_ref: importRef,
      });

      if (insertError) {
        console.error("[flowise/whatsapp] insert error:", insertError);
        await waSend(from, "I read the receipt but couldn't save it — please try again in a moment.");
        continue;
      }

      try {
        await syncAccountBalance(supabase, account.id as string, userId);
      } catch (syncErr) {
        console.error("[flowise/whatsapp] balance sync failed (tx saved):", syncErr);
      }

      const categoryName = extracted.category_id
        ? SYSTEM_CATEGORIES.find((c) => c.id === extracted.category_id)?.name ?? "Uncategorised"
        : "Uncategorised";
      const kind = extracted.amount > 0 ? "💰 Income" : "💸 Expense";

      await waSend(
        from,
        `${kind} logged ✅\n\n${fmtAmount(extracted.amount)} — ${description}\n📁 ${categoryName}\n📅 ${date}\n🏦 ${account.name}\n\nWrong details? Edit it in Flowise → Transactions.`
      );
    } catch (err) {
      console.error("[flowise/whatsapp] processing error:", err);
      await waSend(from, "Something went wrong reading that receipt — please try again.");
    }
  }

  return NextResponse.json({ ok: true });
}
