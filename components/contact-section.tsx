"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Twitter, Linkedin, Mail, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;

    await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // @ts-ignore
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then(() => {
        toast.success("Your message has been sent successfully!");
        setIsSubmitted(true);
        form.reset();
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        toast.error(
          "There was an error submitting your message. Please try again later."
        );
      })
      .finally(() => {
        setIsSubmitting(false);
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000); // Reset submitted state after 3 seconds
      });
  };

  return (
    <section id="contact" className="py-20">
      <h2 className="text-3xl font-bold mb-2">Let's Build Together</h2>
      <div className="h-1 w-20 bg-primary mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg mb-6">
            Whether you're looking to collaborate on a project, discuss a
            potential opportunity, or just want to connect about faith and
            technology, I'd love to hear from you.
          </p>

          <div className="terminal-card mb-6">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-500"></div>
              <div className="terminal-dot bg-yellow-500 ml-1"></div>
              <div className="terminal-dot bg-green-500 ml-1"></div>
              <div className="ml-2 text-xs text-muted-foreground">
                contact.js
              </div>
            </div>

            <div className="code-block">
              <pre className="text-xs">
                <code>
                  {`const contact = {
  email: "michojekunle1@gmail.com",
  github: "michojekunle",
  twitter: "@devvmichael",
  linkedin: "michael-ojekunle",
  location: "Lagos, Nigeria",
  availability: "Open to interesting projects",
  response_time: "Usually within 24 hours"
}`}
                </code>
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link
                href="https://github.com/michojekunle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link
                href="https://x.com/devvmichael"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link
                href="https://linkedin.com/in/michael-ojekunle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
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
                placeholder="What's this about?"
                required
                minLength={10}
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
                <>
                  <span>Message Sent!</span>
                </>
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
