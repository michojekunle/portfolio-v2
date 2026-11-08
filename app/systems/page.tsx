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
  Shipped: "border-(--v3-accent) text-(--v3-accent)",
  "In progress": "border-(--ink) text-(--ink)",
  Planned: "border-(--rule) text-muted-foreground",
}

function StatusLabel({ status }: { status: LayerStatus }): React.ReactElement {
  return (
    <span
      className={`inline-block text-[13px] font-medium px-3 py-1 rounded-full border ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  )
}

function RailNode({ status }: { status: LayerStatus }): React.ReactElement {
  if (status === "Shipped") {
    return <span aria-hidden="true" className="block w-3.5 h-3.5 rounded-full bg-(--v3-accent)" />
  }
  if (status === "In progress") {
    return (
      <span
        aria-hidden="true"
        className="block w-3.5 h-3.5 rounded-full border-2 border-(--ink) bg-[linear-gradient(90deg,var(--ink)_50%,var(--bg)_50%)]"
      />
    )
  }
  return <span aria-hidden="true" className="block w-3.5 h-3.5 rounded-full border-2 border-(--rule) bg-(--bg)" />
}

function StepIcon({ state }: { state: StepState }): React.ReactElement {
  if (state === "done") return <Check className="w-4 h-4 text-(--v3-accent) shrink-0 mt-[3px]" aria-hidden="true" />
  if (state === "doing") return <CircleDot className="w-4 h-4 text-(--ink) shrink-0 mt-[3px]" aria-hidden="true" />
  return <Circle className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-[3px]" aria-hidden="true" />
}

const STATE_TEXT: Record<StepState, string> = {
  done: "Done",
  doing: "In progress",
  todo: "Not started",
}

export default function SystemsPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      {/* Intro */}
      <section className="v3-container pt-40 pb-20 max-[720px]:pt-24 max-[720px]:pb-12 border-b border-(--rule)">
        <h1 className="m-0 font-display font-light text-[clamp(44px,8.5vw,112px)] leading-[0.95] tracking-[-0.03em] text-(--ink) mb-10 max-w-[14ch] text-balance fvs-display">
          How far down the stack I&apos;ve{" "}
          <em className="italic text-(--v3-accent) fvs-soft">been.</em>
        </h1>
        <div className="grid grid-cols-[1.2fr_1fr] max-[920px]:grid-cols-1 gap-10 items-end">
          <p className="m-0 text-[clamp(18px,2.1vw,24px)] leading-[1.55] text-secondary-foreground max-w-[48ch]">
            Most of my career has been near the surface: interfaces, APIs and the glue between
            them. I&apos;m going lower, one layer at a time, and I&apos;m keeping the score in
            public. Each layer below says what exists and what doesn&apos;t.
          </p>
          <dl className="m-0 flex flex-wrap gap-x-8 gap-y-3 text-[14px] text-secondary-foreground">
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
        <div className="flex justify-between text-[13px] text-muted-foreground mb-6 pl-10 max-[720px]:pl-8">
          <span>Surface</span>
          <span>Closer to the machine</span>
        </div>
        <ol className="list-none m-0 p-0 relative">
          <span
            aria-hidden="true"
            className="absolute left-[6px] top-3 bottom-3 w-px bg-(--rule)"
          />
          {LAYERS.map((l) => (
            <li
              key={l.layer}
              className="relative grid grid-cols-[28px_1fr] max-[720px]:grid-cols-[22px_1fr] gap-x-3 pb-14 last:pb-0"
            >
              <div className="pt-2 flex justify-start relative z-10">
                <RailNode status={l.status} />
              </div>
              <div className="grid grid-cols-[1fr_auto] max-[720px]:grid-cols-1 gap-x-10 gap-y-4 min-w-0">
                <div className="min-w-0">
                  <div className="text-[14px] text-muted-foreground mb-1">{l.layer}</div>
                  <h3 className="m-0 font-display font-normal text-[clamp(26px,3.2vw,40px)] leading-[1.1] tracking-[-0.02em] text-(--ink) fvs-text">
                    {l.name}
                  </h3>
                </div>
                <div className="pt-1 max-[720px]:order-first max-[720px]:pt-0">
                  <StatusLabel status={l.status} />
                </div>
                <div className="col-span-2 max-[720px]:col-span-1 grid grid-cols-2 max-[720px]:grid-cols-1 gap-x-12 gap-y-5 max-w-[960px]">
                  <div>
                    <div className="text-[13px] font-medium text-(--ink) mb-1.5">What exists</div>
                    <p className="m-0 text-[16px] leading-[1.65] text-secondary-foreground max-w-[44ch]">
                      {l.exists}
                    </p>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-(--ink) mb-1.5">What&apos;s missing</div>
                    <p className="m-0 text-[16px] leading-[1.65] text-secondary-foreground max-w-[44ch]">
                      {l.missing}
                    </p>
                  </div>
                </div>
                {l.href && (
                  <div className="col-span-2 max-[720px]:col-span-1">
                    <Link
                      href={l.href}
                      {...(l.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex items-center gap-1 text-[15px] font-medium text-(--v3-accent) hover:text-(--ink) transition-colors underline decoration-(--rule) underline-offset-4"
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
        <div className="grid grid-cols-[1fr_1.4fr] max-[920px]:grid-cols-1 gap-x-16 gap-y-6 mb-14">
          <h2
            id="milestones-heading"
            className="m-0 font-display font-light text-[clamp(36px,5vw,64px)] leading-none tracking-[-0.03em] text-(--ink) fvs-display"
          >
            The next <em className="italic text-(--v3-accent) fvs-soft">three.</em>
          </h2>
          <p className="m-0 text-[17px] leading-[1.7] text-secondary-foreground max-w-[56ch]">
            I work in milestones at my own pace, not on a calendar. A milestone is finished when
            its gate is met and the artifacts are public, and not before.
          </p>
        </div>
        <ol className="list-none m-0 p-0 grid grid-cols-3 max-[1100px]:grid-cols-1 gap-x-12 gap-y-16">
          {MILESTONES.map((m, i) => (
            <li key={m.title} className="flex flex-col gap-6 border-t border-(--ink) pt-6 min-w-0">
              <div>
                <div className="text-[14px] text-muted-foreground mb-2">Milestone {i + 1}</div>
                <h3 className="m-0 font-display font-normal text-[28px] leading-[1.15] tracking-[-0.02em] text-(--ink) fvs-text">
                  {m.title}
                </h3>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {m.steps.map((st) => (
                  <li key={st.label} className="flex gap-3 items-start text-[16px] leading-[1.5] text-secondary-foreground">
                    <StepIcon state={st.state} />
                    <span className={st.state === "done" ? "text-(--ink)" : undefined}>
                      {st.label}
                      <span className="sr-only"> ({STATE_TEXT[st.state]})</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="m-0 text-[15px] leading-[1.6] text-muted-foreground max-w-[40ch]">
                <span className="text-(--ink) font-medium">Gate: </span>
                {m.gate}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Definition of done */}
      <section className="v3-container py-20 max-[720px]:py-12" aria-labelledby="done-heading">
        <div className="grid grid-cols-[1fr_1.4fr] max-[920px]:grid-cols-1 gap-x-16 gap-y-8">
          <h2
            id="done-heading"
            className="m-0 font-display font-light text-[clamp(36px,5vw,64px)] leading-none tracking-[-0.03em] text-(--ink) fvs-display"
          >
            What &ldquo;done&rdquo; <em className="italic text-(--v3-accent) fvs-soft">means.</em>
          </h2>
          <ul className="list-none m-0 p-0 flex flex-col">
            {DONE_MEANS.map((d) => (
              <li
                key={d.name}
                className="grid grid-cols-[minmax(0,14rem)_1fr] max-[720px]:grid-cols-1 gap-x-8 gap-y-1 py-5 border-t border-(--rule) first:border-t-0 first:pt-0"
              >
                <span className="text-[17px] font-medium text-(--ink)">{d.name}</span>
                <span className="text-[16px] leading-[1.6] text-secondary-foreground">{d.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
