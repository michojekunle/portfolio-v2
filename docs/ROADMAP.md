# Systems & AI Infrastructure Roadmap (milestone-based)

This roadmap replaces the earlier calendar-based plan. It is paced by milestones, not dates. The hours budget (about 18 a week alongside other work) is a guide, not a promise. A milestone is done when its artifacts exist.

Direction: Rust and systems engineering as the foundation, distributed systems next, then AI infrastructure. Zamir is the product thread running through every phase.

## Definition of done

Systems projects are not finished without:

1. An architecture decision record: why this design, what was rejected.
2. Reproducible benchmarks: p50/p95/p99 latency and throughput, with the harness in the repo.
3. Failure analysis: behaviour under partitions, dropped packets or memory pressure.
4. Profiles: flamegraphs of CPU and memory hotspots. On macOS use `cargo flamegraph` or `samply`; use a Linux VM or container where Linux `perf` is needed.
5. Diagrams: dataflow and state transitions.

Product work (Zamir, client sites) uses a lighter version: an ADR, measured results and a short write-up of known limits.

## Milestone 1: Production systems and memory

- Free-list allocator with block splitting, coalescing and alignment, benchmarked against the system allocator.
- Async networking server with connection handling and graceful shutdown.
- A production Rust backend using Axum, SQLx and Postgres. Candidate: move one real Zamir backend responsibility, such as the credits ledger, to a Rust service.
- Continue the OS kernel (`no_std`).
- Close the gaps: Tokio, concurrency in practice, integration tests, a deployed (not local-only) Rust service.

Gate: allocator and server documented in public with benchmarks and flamegraphs.

## Milestone 2: Distributed systems and storage

- Distributed key-value engine (`raft-kv`): Raft leader election and log replication, write-ahead log, snapshots, tests under simulated partitions.
- Storage internals: LSM-trees, SSTables, B-trees.
- Observability: tracing with OpenTelemetry, metrics, dashboards.
- Go for infrastructure work, at working proficiency.

Gate: a cluster that survives leader loss and partitions, with the failure analysis published.

## Milestone 3: AI infrastructure

- Measure Zamir's generation pipeline properly: one row per generation (provider, model, latency, cost, outcome) tied to the credits ledger, giving real cost-per-song and failure rates.
- Inference gateway in Rust: request batching, streaming, caching, backend load balancing, benchmarked for tail latency.
- Study inference serving internals (batching, KV cache, quantisation) and write about it.

Gate: a gateway with published benchmarks, fed by real Zamir traffic patterns.

## Cryptography thread (light, continuous)

Keep the `zk` repository alive without making it a phase: publish the Criterion benchmark results with their method, add an ADR per protocol, and fix correctness issues as they are found. Revisit a larger verifiable-computation project later, once the systems foundation exists. Verifiable machine learning is deliberately off the roadmap for now.

## Reading thread

Weekly reading on the craft of building, history, economics, law and finance, tracked on the existing Reading page.

## Roles to target, in order

1. Now: Rust or backend engineer, product engineer with real ownership.
2. Next: infrastructure or platform engineer.
3. Developing: distributed systems, storage or networking engineer.
4. Later: AI infrastructure or inference engineer.

Apply with fewer, tailored applications backed by a finished milestone, rather than by volume.

## What to avoid

- Chasing every new AI framework.
- Presenting a direction as a track record.
- Publishing numbers that cannot be reproduced or verified.
