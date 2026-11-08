"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function TopicSuggestionDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.topic.trim()) {
      toast.error("Please provide both a name and a topic.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: "topic-suggestion@michaelojekunle.dev", // Dummy email to pass Zod schema
          subject: `[Topic Suggestion] ${formData.topic.substring(0, 50)}`,
          message: `Suggested Topic/Title: ${formData.topic}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit suggestion");
      }

      toast.success("Topic suggested!", {
        description: "Thanks for the idea. I'll check it out.",
      });
      setIsOpen(false);
      setFormData({ name: "", topic: "" });
    } catch (error) {
      toast.error("Error submitting suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-(--paper) border-(--rule)">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-(--ink)">Suggest a Topic</DialogTitle>
          <DialogDescription className="text-secondary-foreground text-sm">
            What should I build or talk about next? Leave your name and a short topic idea.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-mono tracking-wider uppercase text-muted-foreground">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Satoshi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-(--rule) bg-(--bg-2) text-(--ink) placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-(--v3-accent)"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="topic" className="text-xs font-mono tracking-wider uppercase text-muted-foreground">
              Topic / Title
            </label>
            <textarea
              id="topic"
              placeholder="e.g. Build a zk-rollup from scratch"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-(--rule) bg-(--bg-2) text-(--ink) placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-(--v3-accent) min-h-[100px] resize-none"
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-(--ink) text-(--bg) font-mono text-[11px] uppercase tracking-widest font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit Suggestion"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
