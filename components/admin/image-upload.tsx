"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Link, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "projects",
}: ImageUploadProps) {
  const [mode, setMode] = useState<"upload" | "url">(value.startsWith("http") && !value.includes("supabase.co") ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image. Make sure the storage bucket exists and is public.");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Project Image
        </label>
        <div className="flex bg-muted rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-sm transition-all ${
              mode === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3 w-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-sm transition-all ${
              mode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link className="h-3 w-3" />
            URL
          </button>
        </div>
      </div>

      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted/50">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {mode === "upload" && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 text-xs backdrop-blur-md"
                onClick={clearImage}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : mode === "upload" ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/50 transition-all group"
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload image</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="https://example.com/image.jpg"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 h-12 bg-muted/30 border-border"
              />
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground italic px-1">
              Paste an absolute URL to an image hosted elsewhere.
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          Uploading to Supabase Storage...
        </div>
      )}
    </div>
  );
}
