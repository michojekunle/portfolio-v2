import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { FileFormat } from "@/lib/chapterly/types";
import { FREE_BOOK_LIMIT } from "@/lib/chapterly/types";

const JsonImportSchema = z.object({
  title: z.string().min(1),
  author: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  file_url: z.string().min(1),
  file_format: z.enum(["pdf","epub","docx","txt","md","html","azw3","mobi","fb2","cbz","other"]).default("md"),
  file_size_bytes: z.number().int().default(0),
});

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_FORMATS = new Set([
  "pdf", "epub", "docx", "txt", "md", "html", "htm", "fb2", "cbz", "azw3", "mobi",
]);

function detectFormat(filename: string): FileFormat {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, FileFormat> = {
    pdf: "pdf", epub: "epub", docx: "docx", txt: "txt",
    md: "md", html: "html", htm: "html", fb2: "fb2",
    cbz: "cbz", azw3: "azw3", mobi: "mobi",
  };
  return map[ext] ?? "other";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Freemium gate — count existing books
  const { count: bookCount } = await supabase
    .from("ch_books")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // TODO: replace with real plan check from a subscriptions table when billing is added
  const isPro = false;

  if (!isPro && (bookCount ?? 0) >= FREE_BOOK_LIMIT) {
    return NextResponse.json(
      { error: `Free plan allows ${FREE_BOOK_LIMIT} books. Upgrade to Pro to add more.` },
      { status: 403 }
    );
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    let jsonBody: unknown;
    try {
      jsonBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = JsonImportSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, author, cover_url, file_url, file_format, file_size_bytes } = parsed.data;

    const { data: book, error: dbError } = await supabase
      .from("ch_books")
      .insert({
        user_id: user.id,
        title,
        author,
        cover_url: cover_url || null,
        file_url,
        file_format,
        file_size_bytes,
        status: "unread",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      book,
      book_id: book.id,
      file_url: book.file_url,
      file_format: book.file_format,
      total_pages: null,
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
  }

  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (!ALLOWED_FORMATS.has(ext)) {
    return NextResponse.json(
      { error: `Unsupported format: .${ext}. Supported: PDF, EPUB, DOCX, TXT, MD, HTML, FB2, CBZ` },
      { status: 415 }
    );
  }

  const titleInput = formData.get("title");
  const authorInput = formData.get("author");
  const bookIdInput = formData.get("book_id");

  const titleRaw = typeof titleInput === "string" ? titleInput.trim() : "";
  const title = titleRaw || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  const author = typeof authorInput === "string" ? authorInput.trim() || null : null;
  const updateBookId = typeof bookIdInput === "string" ? bookIdInput : null;

  const format = detectFormat(file.name);
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storagePath = `chapterly/${user.id}/${safeName}`;

  const bytes = await file.arrayBuffer();

  const { error: storageError } = await supabase.storage
    .from("user-uploads")
    .upload(storagePath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageError) {
    return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(storagePath);

  if (!urlData.publicUrl) {
    await supabase.storage.from("user-uploads").remove([storagePath]);
    return NextResponse.json({ error: "Failed to generate public URL for uploaded file" }, { status: 500 });
  }

  let book: any;
  let dbError: any;

  if (updateBookId) {
    const res = await supabase
      .from("ch_books")
      .update({
        file_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", updateBookId)
      .eq("user_id", user.id)
      .select()
      .single();
    book = res.data;
    dbError = res.error;
  } else {
    const res = await supabase
      .from("ch_books")
      .insert({
        user_id: user.id,
        title,
        author,
        file_url: urlData.publicUrl,
        file_format: format,
        file_size_bytes: file.size,
        status: "unread",
      })
      .select()
      .single();
    book = res.data;
    dbError = res.error;
  }

  if (dbError) {
    // Attempt to clean up the uploaded file
    await supabase.storage.from("user-uploads").remove([storagePath]);
    return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    book,
    book_id: book.id,
    file_url: urlData.publicUrl,
    file_format: format,
    total_pages: null,
  });
}
