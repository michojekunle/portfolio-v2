import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Check, Circle, CircleDot } from "lucide-react"

export const metadata: Metadata = {
  title: "Systems",
  description:
    "How far down the stack I've been, in public: what exists, what's missing and what's next across Rust, cryptography, memory and operating systems.",
}

type LayerStatus = "Shipped" | "In progress" | "Planned"
type StepState = "done" | "doing" | "todo"

interface Layer {
  layer: string
  name: string
  status: LayerStatus
  exists: string
  missing: string
  href?: string
  hrefLabel?: string
}

const LAYERS: Layer[] = [
  {
    layer: "Interface",
    name: "Products people use",
    status: "Shipped",
    exists:
      "Zamir (web and mobile), CoinSafe's app and wallet onboarding, and client sites, all in production.",
    missing: "Nothing blocking. This is where most of my four years went.",
    href: "/work",
    hrefLabel: "See the work",
  },
  {
    layer: "Services",
    name: "APIs, auth and data",
    status: "Shipped",
    exists:
      "Node API routes, Postgres through Supabase, Keycloak authentication and email, behind real products.",
    missing:
      "A Rust service in production. Tokio and concurrency are still more theory than practice for me.",
  },
  {
    layer: "Protocols",
    name: "ZK proof systems in Rust",
    status: "In progress",
    exists:
      "GKR, KZG commitments and Sumcheck, with polynomial arithmetic, Fiat–Shamir, tests and a Criterion benchmark harness.",
    missing:
      "Published benchmark numbers with their method, and a write-up of each protocol's design decisions.",
    href: "/work/zk-implementations",
    hrefLabel: "Case study",
  },
  {
    layer: "Memory",
    name: "Allocators",
    status: "In progress",
    exists: "A bump allocator, implemented.",
    missing:
      "The linked-list (free-list) allocator, tests, and benchmarks against the system allocator. Not finished, so not presented as finished.",
  },
  {
    layer: "Kernel",
    name: "An operating system in Rust",
    status: "In progress",
    exists:
      "Kernel fundamentals and memory management, following the blog_os approach, plus data-structure practice in rust-learn.",
    missing: "The no_std implementation isn't complete yet.",
    href: "https://github.com/michojekunle/rust-learn",
    hrefLabel: "rust-learn on GitHub",
  },
]

interface Milestone {
  title: string
  gate: string
  steps: { label: string; state: StepState }[]
}

const MILESTONES: Milestone[] = [
  {
    title: "Production systems and memory",
    gate: "Allocator and server documented in public, with benchmarks and flamegraphs.",
    steps: [
      { label: "Bump allocator", state: "done" },
      { label: "Free-list allocator with splitting and coalescing", state: "doing" },
      { label: "Benchmarks against the system allocator", state: "todo" },
      { label: "Async networking server with graceful shutdown", state: "todo" },
      { label: "Rust backend with Axum, SQLx and Postgres, deployed", state: "todo" },
    ],
  },
  {
    title: "Distributed systems and storage",
    gate: "A cluster that survives leader loss and partitions, with the failure analysis published.",
    steps: [
      { label: "Raft leader election and log replication", state: "todo" },
      { label: "Write-ahead log and snapshots", state: "todo" },
      { label: "Failure tests under simulated partitions", state: "todo" },
    ],
  },
  {
    title: "AI infrastructure",
    gate: "A gateway with published tail-latency benchmarks, driven by real usage patterns.",
    steps: [
      { label: "Per-generation cost and failure tracking in Zamir", state: "todo" },
      { label: "Inference gateway with batching and streaming", state: "todo" },
      { label: "Load tests reporting p95 and p99", state: "todo" },
    ],
  },
]

const DONE_MEANS: { name: string; detail: string }[] = [
  { name: "A design record", detail: "Why this design, and what I rejected." },
  { name: "Reproducible benchmarks", detail: "Latency percentiles and throughput, with the harness in the repo." },
  { name: "Failure analysis", detail: "What happens under partitions, drops or memory pressure." },
  { name: "Profiles", detail: "Flamegraphs showing where the time and cache misses go." },
  { name: "Diagrams", detail: "Dataflow and state transitions you can follow without the code." },
]

const STATUS_STYLE: Record<LayerStatus, string> = {
  Shipped: "border-(--v3-accent) text-(--v3-accent) bg-[color-mix(in_oklab,var(--v3-accent)_8%,transparent)]",
  "In progress": "border-(--ink) text-(--ink) bg-[color-mix(in_oklab,var(--ink)_6%,transparent)]",
  Planned: "border-(--rule) text-muted-foreground bg-(--bg)",
}

function StatusLabel({ status }: { status: LayerStatus }): React.ReactElement {
  return (
    <span
      className={`inline-block text-[12px] font-mono tracking-[0.04em] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  )
}

function RailNode({ status }: { status: LayerStatus }): React.ReactElement {
  if (status === "Shipped") {
    return <span aria-hidden="true" className="block w-3.5 h-3.5 rounded-full bg-(--v3-accent) ring-4 ring-(--bg)" />
  }
  if (status === "In progress") {
    return (
      <span
        aria-hidden="true"
        className="block w-3.5 h-3.5 rounded-full border-2 border-(--ink) bg-[linear-gradient(90deg,var(--ink)_50%,var(--bg)_50%)] ring-4 ring-(--bg)"
      />
    )
  }
  return <span aria-hidden="true" className="block w-3.5 h-3.5 rounded-full border-2 border-(--rule) bg-(--bg) ring-4 ring-(--bg)" />
}

function StepIcon({ state }: { state: StepState }): React.ReactElement {
  if (state === "done") return <Check className="w-4 h-4 text-(--v3-accent) shrink-0 mt-[2px]" aria-hidden="true" />
  if (state === "doing") return <CircleDot className="w-4 h-4 text-(--ink) shrink-0 mt-[2px]" aria-hidden="true" />
  return <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-[2px]" aria-hidden="true" />
}

const STATE_TEXT: Record<StepState, string> = {
  done: "Done",
  doing: "In progress",
  todo: "Not started",
}

export default function SystemsPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      {/* Intro / Hero */}
      <section className="v3-container pt-36 pb-18 max-[720px]:pt-24 max-[720px]:pb-12 border-b border-(--rule)">
        <h1 className="m-0 font-display font-light text-[clamp(44px,7.5vw,98px)] leading-[0.92] tracking-[-0.035em] text-(--ink) mb-8 max-w-[16ch] text-balance fvs-display">
          How far down the stack I&apos;ve{" "}
          <em className="italic text-(--v3-accent) fvs-soft">been.</em>
        </h1>
        <div className="grid grid-cols-[1.3fr_1fr] max-[920px]:grid-cols-1 gap-10 items-end">
          <p className="m-0 text-[clamp(17px,2vw,20px)] leading-[1.6] text-secondary-foreground max-w-[50ch]">
            Most of my career has been near the surface: interfaces, APIs and the glue between
            them. I&apos;m going lower, one layer at a time, and I&apos;m keeping the score in
            public. Each layer below says what exists and what doesn&apos;t.
          </p>
          <dl className="m-0 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-mono text-secondary-foreground">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Shipped</dt>
              <RailNode status="Shipped" />
              <dd className="m-0">Shipped</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">In progress</dt>
              <RailNode status="In progress" />
              <dd className="m-0">In progress</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Planned</dt>
              <RailNode status="Planned" />
              <dd className="m-0">Planned</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Depth map */}
      <section className="v3-container py-20 max-[720px]:py-12 border-b border-(--rule)" aria-labelledby="depth-heading">
        <h2 id="depth-heading" className="sr-only">
          Layers, from the interface down to the kernel
        </h2>
        <div className="flex justify-between items-center text-[12px] font-mono tracking-[0.06em] text-muted-foreground mb-8 pl-10 max-[720px]:pl-8">
          <span>Surface (Higher abstraction)</span>
          <span>Closer to the machine (Deep systems)</span>
        </div>

        <ol className="list-none m-0 p-0 relative">
          <span
            aria-hidden="true"
            className="absolute left-[13px] top-6 bottom-6 w-px bg-(--rule)"
          />
          {LAYERS.map((l) => (
            <li
              key={l.layer}
              className="relative grid grid-cols-[28px_1fr] max-[720px]:grid-cols-[22px_1fr] gap-x-4 max-[720px]:gap-x-3 pb-8 last:pb-0"
            >
              <div className="pt-6 flex justify-center relative z-10">
                <RailNode status={l.status} />
              </div>

              {/* Contained Card for each Layer */}
              <div className="p-6 max-[720px]:p-5 rounded-2xl border border-(--rule) bg-(--bg-2) flex flex-col gap-5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--rule)/60 pb-4">
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground mb-1">
                      {l.layer} layer
                    </div>
                    <h3 className="m-0 font-display font-normal text-[clamp(22px,2.8vw,32px)] leading-[1.15] tracking-[-0.02em] text-(--ink) fvs-text">
                      {l.name}
                    </h3>
                  </div>
                  <div>
                    <StatusLabel status={l.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-6">
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.06em] text-(--ink) font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                      What exists
                    </div>
                    <p className="m-0 text-[15px] leading-[1.65] text-secondary-foreground">
                      {l.exists}
                    </p>
                  </div>
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      What&apos;s missing
                    </div>
                    <p className="m-0 text-[15px] leading-[1.65] text-secondary-foreground">
                      {l.missing}
                    </p>
                  </div>
                </div>

                {l.href && (
                  <div className="pt-3 border-t border-(--rule)/60">
                    <Link
                      href={l.href}
                      {...(l.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex items-center gap-1 font-mono text-[12px] tracking-[0.04em] font-medium text-(--v3-accent) hover:text-(--ink) transition-colors no-underline"
                    >
                      {l.hrefLabel}
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Milestones */}
      <section className="v3-container py-20 max-[720px]:py-12 border-b border-(--rule)" aria-labelledby="milestones-heading">
        <div className="grid grid-cols-[1fr_1.4fr] max-[920px]:grid-cols-1 gap-x-16 gap-y-6 mb-12">
          <h2
            id="milestones-heading"
            className="m-0 font-display font-light text-[clamp(32px,4.5vw,52px)] leading-none tracking-[-0.025em] text-(--ink) fvs-display"
          >
            The next <em className="italic text-(--v3-accent) fvs-soft">three.</em>
          </h2>
          <p className="m-0 text-[16px] leading-[1.65] text-secondary-foreground max-w-[56ch]">
            I work in milestones at my own pace, not on a calendar. A milestone is finished when
            its gate is met and the artifacts are public, and not before.
          </p>
        </div>

        <ol className="list-none m-0 p-0 grid grid-cols-3 max-[1100px]:grid-cols-1 gap-6">
          {MILESTONES.map((m, i) => (
            <li
              key={m.title}
              className="p-7 max-[720px]:p-5 rounded-2xl border border-(--rule) bg-(--bg-2) flex flex-col justify-between gap-6 min-w-0"
            >
              <div>
                <div className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground mb-1.5">
                  Milestone {i + 1}
                </div>
                <h3 className="m-0 font-display font-normal text-[22px] leading-[1.2] tracking-[-0.015em] text-(--ink) fvs-text mb-5">
                  {m.title}
                </h3>

                <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                  {m.steps.map((st) => (
                    <li key={st.label} className="flex gap-2.5 items-start text-[14px] leading-[1.5] text-secondary-foreground">
                      <StepIcon state={st.state} />
                      <span className={st.state === "done" ? "text-(--ink) font-medium" : undefined}>
                        {st.label}
                        <span className="sr-only"> ({STATE_TEXT[st.state]})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-(--rule)/60 bg-(--bg) text-[13px] leading-relaxed text-secondary-foreground">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-(--ink) font-semibold block mb-1">
                  Gate:
                </span>
                {m.gate}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Definition of done */}
      <section className="v3-container py-20 max-[720px]:py-12" aria-labelledby="done-heading">
        <div className="grid grid-cols-[1fr_1.4fr] max-[920px]:grid-cols-1 gap-x-16 gap-y-8">
          <h2
            id="done-heading"
            className="m-0 font-display font-light text-[clamp(32px,4.5vw,52px)] leading-none tracking-[-0.025em] text-(--ink) fvs-display"
          >
            What &ldquo;done&rdquo; <em className="italic text-(--v3-accent) fvs-soft">means.</em>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {DONE_MEANS.map((d) => (
              <div
                key={d.name}
                className="p-5 max-[720px]:p-4 rounded-xl border border-(--rule) bg-(--bg-2) grid grid-cols-[200px_1fr] max-[720px]:grid-cols-1 gap-4 items-baseline"
              >
                <span className="font-display text-[17px] font-normal text-(--ink) fvs-text">{d.name}</span>
                <span className="text-[15px] leading-[1.6] text-secondary-foreground">{d.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
