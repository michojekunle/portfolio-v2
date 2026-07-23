"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export function NewsletterForm(): React.ReactElement {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  // Zod schema for email validation
  const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim()
    .transform((val: string) => val.toLowerCase());

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    setStatus("loading");

    try {
      // Validate email with Zod
      const validatedEmail = emailSchema.parse(email);

      const supabase = createClient();

      const { error } = await supabase.from("email_subscribers").insert([
        {
          email: validatedEmail,
        },
      ]);

      if (error) {
        // Handle duplicate email
        if (
          error.code === "23505" ||
          error.message.toLowerCase().includes("duplicate")
        ) {
          toast.success("You're already subscribed! 🎉");
          setStatus('idle');
          setEmail("")
          return;
        } else {
          throw new Error(error.message);
        }
      } else {
        setStatus("success");
        toast.success("You're subscribed! I'll send new posts your way.");
        setEmail("");
        // Reset to idle after 4 s so the user can re-submit if needed
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch (err: unknown) {
      setStatus("idle");

      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message ?? "Invalid email");
      } else {
        console.error("[subscribe]", err);
        toast.error("Subscription failed. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-[400px]">
      <Input
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status !== "idle"}
        className="flex-1 bg-(--bg) border-(--rule) h-12 rounded-md focus:ring-0 focus:border-(--v3-accent) text-[14px]"
      />
      <button 
        type="submit" 
        disabled={status !== "idle"}
        className="h-12 px-6 bg-(--ink) text-(--bg) rounded-md font-mono text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-300 hover:bg-(--v3-accent) disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-30"
      >
        {status === "loading" ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : status === "success" ? (
          "Done"
        ) : (
          "Subscribe"
        )}
      </button>
    </form>
  );
}
