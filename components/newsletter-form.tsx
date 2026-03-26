"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function NewsletterForm(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setStatus("loading")

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email: email.trim().toLowerCase() }])

      if (error) throw new Error(error.message)

      setStatus("success")
      toast.success("You're subscribed! I'll send new posts your way.")
    } catch (err: unknown) {
      console.error("[subscribe]", err)
      toast.error("Subscription failed. Please try again.")
      setStatus("idle")
    }
  }

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
        {status === "loading" ? "..." : status === "success" ? "Subscribed" : "Subscribe"}
      </Button>
    </form>
  )
}
