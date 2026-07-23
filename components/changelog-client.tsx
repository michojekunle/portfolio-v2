"use client"

import { format, formatDistanceToNow } from "date-fns"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface ChangelogEntry {
  repo: string
  repoUrl: string
  message: string
  date: string
  url: string
  sha: string
}

export function ChangelogClient({ grouped }: { grouped: [string, ChangelogEntry[]][] }) {
  return (
    <div className="v3-changelog">
      {grouped.map(([dateKey, dayEntries], i) => (
        <motion.div 
          key={dateKey} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="entry"
        >
          <div className="date">{format(new Date(dateKey), "MMMM d, yyyy")}</div>
          <div className="body">
            <h3>{format(new Date(dateKey), "EEEE")}</h3>
            <ul>
              {dayEntries.map((entry) => (
                <li key={entry.url}>
                  {entry.message}{" "}
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    style={{ color: "var(--v3-accent)", textDecoration: "none" }}
                  >
                    <span className="font-mono text-[11px]">
                      {entry.repo}#{entry.sha}
                    </span>
                    <ExternalLink
                      className="inline transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{ width: "10px", height: "10px", marginLeft: "4px" }}
                      aria-hidden="true"
                    />
                  </a>
                  <span className="font-mono text-[10px] text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
