import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // This route uses the service-role key to bypass storage RLS, so it must
  // gate on an authenticated session itself — there is no RLS backstop here.
  const authClient = await createServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const adminEmail = process.env.CONTACT_TO_EMAIL || "info@michaelojekunle.dev";

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "projects";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Limit size to 5MB to avoid server/memory crashes
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds the 5MB limit" }, { status: 400 });
    }

    // Restrict to image MIME types
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Limit allowed target buckets
    const allowedBuckets = ["projects", "blog", "videos"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid storage bucket target" }, { status: 400 });
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
  } catch (error: unknown) {
    console.error("Server upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to storage" },
      { status: 500 }
    );
  }
}
