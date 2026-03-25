"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Twitter, Linkedin, Mail, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message?: string;
}

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload: ContactPayload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    const form = e.currentTarget;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as ContactResponse;

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Submission failed");
      }

      toast.success("Message sent! I'll get back to you soon.");
      setIsSubmitted(true);
      form.reset();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      console.error("[contact] Submission error:", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section id="contact" className="py-20">
      <h2 className="text-3xl font-bold mb-2">Let&apos;s Build Together</h2>
      <div className="section-rule" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Whether you&apos;re looking to collaborate on a project, discuss a potential opportunity, or just want to
            connect about faith and technology, I&apos;d love to hear from you.
          </p>

          <div className="content-card mb-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm font-medium">michojekunle1@gmail.com</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Location</p>
              <p className="text-sm font-medium">Lagos, Nigeria</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Availability</p>
              <p className="text-sm font-medium">Open to interesting projects</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Response time</p>
              <p className="text-sm font-medium">Usually within 24 hours</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="mailto:michojekunle1@gmail.com">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={isSubmitting || isSubmitted}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email"
                  required
                  disabled={isSubmitting || isSubmitted}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                placeholder="What&apos;s this about?"
                required
                minLength={2}
                maxLength={200}
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Your message..."
                rows={5}
                required
                minLength={10}
                maxLength={1000}
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : isSubmitted ? (
                <span>Message Sent!</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
