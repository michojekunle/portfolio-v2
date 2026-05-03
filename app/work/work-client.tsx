"use client"

import { useState } from "react"
import Link from "next/link"
import { CASE_STUDIES } from "@/lib/case-studies"

const CATS = ["all", "web3", "product", "oss"] as const
type Cat = (typeof CATS)[number]

export function WorkClient(): React.ReactElement {
  const [filter, setFilter] = useState<Cat>("all")

  const filtered =
    filter === "all" ? CASE_STUDIES : CASE_STUDIES.filter((p) => p.cat === filter)

  return (
    <section className="v3-container">
      <div className="v3-work-filters">
        <span className="lbl">Filter</span>
        {CATS.map((c) => (
          <button
            key={c}
            className={`v3-filter-pill${filter === c ? " active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c === "all" ? "All" : c === "oss" ? "OSS" : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className="v3-work-list">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/work/${p.slug}`} className="v3-work-row">
            <div className="idx">{p.idx}</div>
            <div>
              <div className="name">{p.name}</div>
              <div className="desc">{p.desc}</div>
            </div>
            <div className="stack-mini">
              {p.stack.slice(0, 4).map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="yr">
              <b>{p.year}</b>
              {p.cat}
            </div>
            <div className="v3-work-arrow" aria-hidden="true">→</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
