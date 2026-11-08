import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Systems",
  description:
    "Rust systems work in public: a memory allocator, an operating-system kernel, data structures and cryptographic protocols, each labelled with its real status, plus the milestones I'm working through.",
}

type Status = "Built" | "In progress" | "Exploring" | "Planned"

interface SystemsItem {
  name: string
  status: Status
  summary: string
  detail: string
  href?: string
  hrefLabel?: string
}

const ITEMS: SystemsItem[] = [
  {
    name: "ZK proof systems",
    status: "In progress",
    summary: "GKR, KZG commitments and Sumcheck in Rust.",
    detail:
      "Protocol implementations with tests and a Criterion benchmark harness. Public, and still a work in progress rather than a production library.",
    href: "/work/zk-implementations",
    hrefLabel: "Read the case study",
  },
  {
    name: "Memory allocators",
    status: "In progress",
    summary: "Bump allocator done, linked-list allocator underway.",
    detail:
      "The bump allocator is implemented. The linked-list allocator is in progress. Tests and benchmarks are not in place yet, so I am not presenting it as finished.",
  },
  {
    name: "Operating-system kernel",
    status: "In progress",
    summary: "A kernel in Rust, following the blog_os approach.",
    detail:
      "Working through kernel fundamentals and memory management. The no_std implementation is not complete yet.",
  },
  {
    name: "Data structures in Rust",
    status: "Built",
    summary: "Linked lists, BFS and DFS, VecDeque-based work.",
    detail:
      "Small implementations that taught me ownership and borrowing the hard way. Useful as practice, not a headline project.",
    href: "https://github.com/michojekunle/rust-learn",
    hrefLabel: "rust-learn on GitHub",
  },
]

const MILESTONES: { phase: string; title: string; outcome: string; status: Status }[] = [
  {
    phase: "1",
    title: "Production systems and memory",
    outcome:
      "A free-list allocator with block splitting and coalescing, benchmarked against the system allocator. An async networking server with graceful shutdown. A production Rust backend with Axum, SQLx and Postgres.",
    status: "In progress",
  },
  {
    phase: "2",
    title: "Distributed systems and storage",
    outcome:
      "A distributed key-value engine with Raft consensus, a write-ahead log and failure tests under simulated partitions.",
    status: "Planned",
  },
  {
    phase: "3",
    title: "AI infrastructure",
    outcome:
      "An inference gateway with request batching, streaming and cost metering, benchmarked for tail latency under load.",
    status: "Planned",
  },
]

const STATUS_STYLES: Record<Status, string> = {
  Built: "border-(--v3-accent-soft) text-(--v3-accent)",
  "In progress": "border-(--rule) text-(--ink)",
  Exploring: "border-(--rule) text-muted-foreground",
  Planned: "border-(--rule) text-muted-foreground",
}

function StatusPill({ status }: { status: Status }): React.ReactElement {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md border ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}

export default function SystemsPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <section className="v3-container pt-40 pb-16 max-[720px]:pt-20 max-[720px]:pb-10 border-b border-(--rule)">
        <div className="font-mono text-xs tracking-wider uppercase text-muted-foreground mb-6">
          Systems
        </div>
        <h1 className="m-0 font-display font-light text-[clamp(40px,8vw,96px)] leading-[0.95] tracking-[-0.03em] text-(--ink) mb-8 text-balance fvs-display">
          Going lower down the stack, <em className="italic text-(--v3-accent) fvs-soft">in public.</em>
        </h1>
        <p className="text-[clamp(18px,2.2vw,24px)] leading-[1.5] text-secondary-foreground max-w-[60ch] m-0">
          The honest version of my systems work: what exists, what is still being built, and what
          comes next. Every item carries its real status.
        </p>
      </section>

      <section className="v3-container py-20 max-[720px]:py-14 border-b border-(--rule)">
        <h2 className="font-mono text-xs tracking-wider uppercase text-muted-foreground mb-10 m-0">
          Projects
        </h2>
        <ul className="list-none p-0 m-0 flex flex-col">
          {ITEMS.map((item) => (
            <li
              key={item.name}
              className="grid grid-cols-[1fr_auto] max-[720px]:grid-cols-1 gap-x-10 gap-y-3 py-8 border-t border-(--rule) first:border-t-0"
            >
              <div className="flex flex-col gap-2 min-w-0">
                <h3 className="m-0 font-display font-normal text-[28px] leading-[1.1] text-(--ink)">
                  {item.name}
                </h3>
                <p className="m-0 text-[17px] text-(--ink)">{item.summary}</p>
                <p className="m-0 text-[16px] leading-[1.7] text-secondary-foreground max-w-[65ch]">
                  {item.detail}
                </p>
                {item.href && (
                  <Link
                    href={item.href}
                    {...(item.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-1 text-[14px] font-medium text-(--v3-accent) hover:text-(--ink) transition-colors underline decoration-(--rule) underline-offset-2 mt-1 w-fit"
                  >
                    {item.hrefLabel}
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className="pt-1 max-[720px]:order-first">
                <StatusPill status={item.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="v3-container py-20 max-[720px]:py-14">
        <h2 className="font-mono text-xs tracking-wider uppercase text-muted-foreground mb-4 m-0">
          Milestones
        </h2>
        <p className="text-[17px] leading-[1.7] text-secondary-foreground max-w-[60ch] mb-10 mt-0">
          I work in milestones at my own pace, not on a calendar. A milestone is done when its
          artifacts exist: working code, tests, reproducible benchmarks and a short write-up of the
          design decisions and known limits.
        </p>
        <ol className="list-none p-0 m-0 flex flex-col">
          {MILESTONES.map((m) => (
            <li
              key={m.phase}
              className="grid grid-cols-[40px_1fr_auto] max-[720px]:grid-cols-[32px_1fr] gap-x-6 gap-y-3 py-8 border-t border-(--rule)"
            >
              <span className="font-mono text-[14px] text-(--v3-accent) pt-1">
                {m.phase.padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2 min-w-0">
                <h3 className="m-0 font-display font-normal text-[24px] leading-[1.15] text-(--ink)">
                  {m.title}
                </h3>
                <p className="m-0 text-[16px] leading-[1.7] text-secondary-foreground max-w-[65ch]">
                  {m.outcome}
                </p>
              </div>
              <div className="pt-1 max-[720px]:col-start-2">
                <StatusPill status={m.status} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
