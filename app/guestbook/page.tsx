import type { Metadata } from "next"
import { GuestbookEntries } from "./guestbook-entries"

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Leave a message, say hi, or share something kind. A digital guestbook by Michael Ojekunle.",
}

import { GuestbookClient } from "@/components/guestbook-client"

export default function GuestbookPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <GuestbookClient />
    </main>
  )
}
