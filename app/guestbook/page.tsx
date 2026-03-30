import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GuestbookEntries } from "./guestbook-entries";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Guestbook",
  description:
    "Leave a message, say hi, or share something kind. A digital guestbook by Michael Ojekunle.",
};

export default function GuestbookPage(): React.ReactElement {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-6 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Home
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Guestbook
          </h1>
          <p className="text-muted-foreground">
            Leave a message, say hello, or share a thought. I&apos;d love to
            hear from you.
          </p>
        </div>

        <GuestbookEntries />
      </main>
      <div className="max-w-2xl mx-auto px-6">
        <Footer />
      </div>
    </>
  );
}
