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
        setEmail(""); // Clear input on success
      }
    } catch (err: unknown) {
      setStatus("idle");

      if (err instanceof z.ZodError) {
        // Show the first validation error
        const errorMessage = (err as any).errors[0]?.message || "Invalid email";
        toast.error(errorMessage);
      } else {
        console.error("[subscribe]", err);
        toast.error("Subscription failed. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
      <Input
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status !== "idle"}
        className="flex-1"
      />
      <Button type="submit" disabled={status !== "idle"}>
        {status === "loading" ? (
          <Loader2 className="animate-spin" />
        ) : status === "success" ? (
          "Subscribed"
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}
