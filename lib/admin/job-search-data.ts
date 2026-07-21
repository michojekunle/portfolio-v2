export type JobRole = "flutter" | "rust";

export interface SkillGapItem {
  name: string;
  priority: "critical" | "high" | "medium" | "low";
  why: string;
  resource: string;
}

export const PRIORITY_CONFIG: Record<SkillGapItem["priority"], { label: string; color: string }> = {
  critical: { label: "Critical", color: "#EF4444" },
  high: { label: "High", color: "#F59E0B" },
  medium: { label: "Medium", color: "#0EA5E9" },
  low: { label: "Low", color: "#94A3B8" },
};

export const SKILLS_GAP: Record<JobRole, SkillGapItem[]> = {
  flutter: [
    { name: "Firebase (FCM + Firestore + Auth)", priority: "critical", why: "Required in 80%+ of Flutter posts — non-negotiable", resource: "https://firebase.google.com/docs/flutter/setup" },
    { name: "Flutter BLoC / Riverpod (shipped app)", priority: "critical", why: "Most teams use one — you need a real shipped project", resource: "https://bloclibrary.dev" },
    { name: "Play Store + App Store deployment", priority: "high", why: "Employers want evidence you've released, not just built locally", resource: "https://docs.flutter.dev/deployment/android" },
    { name: "Widget & Integration Testing", priority: "high", why: "Common filter in technical screens for mid/senior roles", resource: "https://docs.flutter.dev/testing/overview" },
    { name: "Flutter CI/CD (Codemagic / Fastlane)", priority: "medium", why: "Expected on any team shipping regular mobile releases", resource: "https://codemagic.io/start/" },
    { name: "Platform Channels (native bridge)", priority: "medium", why: "Needed for apps touching hardware, payments, or native APIs", resource: "https://docs.flutter.dev/platform-integration/platform-channels" },
    { name: "Rive / Lottie Animations", priority: "medium", why: "Differentiator for consumer-facing app roles", resource: "https://rive.app/docs" },
  ],
  rust: [
    { name: "gRPC + tonic + protobuf", priority: "critical", why: "Dominant service-to-service pattern in Rust systems jobs", resource: "https://github.com/hyperium/tonic" },
    { name: "WebAssembly (wasm-pack / wasm-bindgen)", priority: "high", why: "Huge demand in blockchain, browser crypto, edge compute", resource: "https://rustwasm.github.io/wasm-pack/" },
    { name: "rust-libp2p networking", priority: "high", why: "Core to blockchain node, DHT, and P2P system roles", resource: "https://github.com/libp2p/rust-libp2p" },
    { name: "Solana / Anchor development", priority: "high", why: "Repeatedly cited in Rust crypto roles", resource: "https://www.anchor-lang.com/" },
    { name: "cargo-fuzz / proptest", priority: "medium", why: "Fuzzing expected in cryptography and high-assurance Rust roles", resource: "https://github.com/rust-fuzz/cargo-fuzz" },
    { name: "Database internals (LSM / B-tree)", priority: "medium", why: "Asked in infra interviews — signals systems depth", resource: "https://github.com/facebook/rocksdb" },
    { name: "rayon / SIMD parallel computation", priority: "medium", why: "Performance-critical ZK proving roles require this", resource: "https://github.com/rayon-rs/rayon" },
  ],
};

export interface ProofOfWorkProject {
  id: string;
  role: JobRole;
  num: number;
  name: string;
  desc: string;
  skills: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  weeks: number;
}

export const PROOF_OF_WORK_PROJECTS: ProofOfWorkProject[] = [
  { id: "p1", role: "flutter", num: 1, name: "Web3 Mobile Wallet", desc: "Flutter dApp wallet — WalletConnect v2, transaction signing, token balances, NFT gallery. Deploy to Play Store.", skills: ["Flutter", "BLoC", "WalletConnect", "Web3", "FCM"], difficulty: "Medium", weeks: 2 },
  { id: "p2", role: "flutter", num: 2, name: "Real-Time Firebase Chat", desc: "Group chat: Firestore, FCM push, Firebase Auth, offline sync. Full widget test suite. Ship to Play Store.", skills: ["Firebase", "Riverpod", "FCM", "Widget Testing", "CI/CD"], difficulty: "Medium", weeks: 2 },
  { id: "p3", role: "flutter", num: 3, name: "CI/CD Flutter Template", desc: "Open-source repo: GitHub Actions + Codemagic + Fastlane — auto-sign and deploy on every merge to main.", skills: ["Codemagic", "Fastlane", "GitHub Actions", "CI/CD"], difficulty: "Easy", weeks: 1 },
  { id: "p4", role: "flutter", num: 4, name: "Animated Portfolio App", desc: "Personal portfolio as a Flutter app — Rive animations, custom painters, responsive layouts. Submit to Play Store.", skills: ["Rive", "Custom Painter", "Animations", "Responsive UI"], difficulty: "Medium", weeks: 2 },
  { id: "p5", role: "flutter", num: 5, name: "Flutter Native Plugin", desc: "Open-source pub.dev package bridging a native capability (BLE or hardware wallet) via Platform Channels + Dart FFI.", skills: ["Platform Channels", "Dart FFI", "pub.dev", "iOS/Android"], difficulty: "Hard", weeks: 3 },
  { id: "p6", role: "rust", num: 1, name: "gRPC Microservice", desc: "Async Rust service: tonic, protobuf schemas, JWT middleware, Postgres via SQLx. Dockerized with health checks.", skills: ["tonic", "protobuf", "Tokio", "SQLx", "Docker"], difficulty: "Medium", weeks: 2 },
  { id: "p7", role: "rust", num: 2, name: "WASM Crypto Library", desc: "Sumcheck verifier compiled to WASM with wasm-bindgen. TypeScript SDK wrapper. Published to npm.", skills: ["WASM", "wasm-bindgen", "Sumcheck", "ZK proofs", "npm"], difficulty: "Medium", weeks: 2 },
  { id: "p8", role: "rust", num: 3, name: "P2P Node (libp2p)", desc: "Peer-to-peer sync node: Kademlia DHT, gossipsub pub/sub, identify protocol. Well-documented open-source repo.", skills: ["rust-libp2p", "DHT", "gossipsub", "async Rust"], difficulty: "Hard", weeks: 3 },
  { id: "p9", role: "rust", num: 4, name: "Mini LSM Key-Value Store", desc: "LevelDB-style engine: memtable, SSTables, compaction, bloom filters, WAL. Benchmarked with criterion.", skills: ["DB internals", "LSM-tree", "Bloom filters", "criterion"], difficulty: "Hard", weeks: 3 },
  { id: "p10", role: "rust", num: 5, name: "ZK Prover CLI", desc: "CLI implementing Sumcheck + GKR for a small arithmetic circuit. Benchmarks vs. reference impl. Published crate.", skills: ["GKR", "Sumcheck", "ZK proofs", "cargo-bench", "crates.io"], difficulty: "Hard", weeks: 2 },
];

export const JOB_BOARDS: { emoji: string; name: string; url: string; tag: "flutter" | "rust" | "both" }[] = [
  { emoji: "💼", name: "LinkedIn Flutter", url: "https://www.linkedin.com/jobs/search/?keywords=Flutter+developer&f_WT=2", tag: "flutter" },
  { emoji: "💼", name: "LinkedIn Rust", url: "https://www.linkedin.com/jobs/search/?keywords=Rust+engineer&f_WT=2", tag: "rust" },
  { emoji: "🚀", name: "Wellfound Flutter", url: "https://wellfound.com/role/r/flutter-developer", tag: "flutter" },
  { emoji: "🚀", name: "Wellfound Rust", url: "https://wellfound.com/role/r/rust-developer", tag: "rust" },
  { emoji: "🦀", name: "RustJobs.dev", url: "https://rustjobs.dev/", tag: "rust" },
  { emoji: "🌍", name: "WWRemotely Flutter", url: "https://weworkremotely.com/remote-jobs-flutter", tag: "flutter" },
  { emoji: "⚡", name: "Arc.dev Flutter", url: "https://arc.dev/remote-jobs/flutter", tag: "flutter" },
  { emoji: "⚡", name: "Arc.dev Rust", url: "https://arc.dev/remote-jobs/rust", tag: "rust" },
  { emoji: "🌐", name: "Web3 Career", url: "https://web3.career/flutter+remote-jobs", tag: "both" },
  { emoji: "🔐", name: "ZK Jobs Board", url: "https://jobsboard.zeroknowledge.fm/", tag: "rust" },
];
