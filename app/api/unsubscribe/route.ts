import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaelojekunle.dev";

function page(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Michael Ojekunle</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f4;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:48px 40px;max-width:400px;width:100%;text-align:center}
    .badge{width:48px;height:48px;background:#0a0a0a;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:20px;font-weight:800;color:#fff;line-height:1}
    h1{font-size:20px;font-weight:700;color:#0a0a0a;letter-spacing:-0.4px;margin-bottom:10px}
    p{font-size:14px;color:#666;line-height:1.7;margin-bottom:24px}
    a{display:inline-block;padding:9px 20px;background:#0a0a0a;color:#fff;font-size:13px;font-weight:500;text-decoration:none;border-radius:7px}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">M</div>
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t");

  if (!token) {
    return page(
      "Invalid link",
      `<p>This unsubscribe link is missing or invalid.</p><a href="${SITE_URL}">Go home</a>`
    );
  }

  let email: string;
  try {
    email = Buffer.from(token, "base64url").toString("utf-8");
    if (!email.includes("@")) throw new Error("not an email");
  } catch {
    return page(
      "Invalid link",
      `<p>This unsubscribe link is corrupted. Please contact me directly.</p><a href="${SITE_URL}">Go home</a>`
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("email_subscribers")
    .delete()
    .eq("email", email.toLowerCase().trim());

  if (error) {
    console.error("[unsubscribe] DB error:", error);
    return page(
      "Something went wrong",
      `<p>We couldn&rsquo;t remove your email. Please try again or reply to any email to unsubscribe.</p><a href="${SITE_URL}">Go home</a>`
    );
  }

  return page(
    "You&rsquo;re unsubscribed",
    `<p>Your email has been removed from all future updates. No hard feelings — thanks for being here.</p><a href="${SITE_URL}">Visit the site</a>`
  );
}
