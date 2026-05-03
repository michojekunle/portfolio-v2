import type { Metadata } from "next"
import { GuestbookEntries } from "./guestbook-entries"

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Leave a message, say hi, or share something kind. A digital guestbook by Michael Ojekunle.",
}

export default function GuestbookPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="v3-util-hero v3-container">
          <div className="v3-eyebrow" style={{ marginBottom: 24 }}>
            <b>/guestbook</b> · leave a note
          </div>
          <h1>
            Sign the <em>guestbook.</em>
          </h1>
          <p>
            Drop a note. Tell me what you&apos;re building, what made you think, or just say hi.
            Persists forever (or until I migrate the database again).
          </p>
        </section>

        <section className="v3-container-narrow">
          <GuestbookEntries />
        </section>
      </main>
  )
}
