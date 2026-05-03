"use client"

import { usePathname } from "next/navigation"
import { ContactCTA } from "@/components/contact-cta"

export function GlobalContactCTA(): React.ReactElement | null {
  const pathname = usePathname()
  if (pathname === "/contact") return null
  return <ContactCTA />
}
