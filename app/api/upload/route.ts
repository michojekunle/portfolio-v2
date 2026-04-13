import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "projects";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Bypass RLS using service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase credentials configuration" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert File to ArrayBuffer/Buffer for Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Ensure bucket exists securely (Using Service Role)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find((b) => b.name === bucket);

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
      });
      if (createError) {
        console.error("Failed to create bucket:", createError);
      }
    }

    // Upload bypassing RLS
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Server upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to storage" },
      { status: 500 }
    );
  }
}
