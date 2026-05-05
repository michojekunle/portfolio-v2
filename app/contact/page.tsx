import type { Metadata } from "next"
import { ContactPage } from "./contact-client"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a call or send a note. Michael Ojekunle is open to contract work, full-time protocol roles, and interesting conversations. Lagos, WAT (UTC+1).",
}

export default function Page(): React.ReactElement {
  return <ContactPage />
}
