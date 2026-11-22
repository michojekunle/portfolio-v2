import Link from "next/link";
import type { ReactElement } from "react";
import { ArrowRight, Check } from "lucide-react";
import { MagneticWrapper } from "@/components/magnetic-wrapper";

export interface LandingContent {
  readonly app: "french" | "spanish";
  readonly language: string;
  readonly appName: string;
  readonly headline: string;
  readonly headlineEm: string;
  readonly intro: string;
  readonly steps: readonly { readonly name: string; readonly body: string }[];
  readonly other: { readonly href: string; readonly label: string };
}

const WHY: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: "Recall before you reread",
    body: "Pulling a word out of memory right before you'd forget it makes it stick far longer than seeing it again. The review schedule does that for you.",
  },
  {
    title: "Real sentences, not lists",
    body: "Words learned inside a short scene come back with their grammar attached, and you hear the scene at natural speed.",
  },
  {
    title: "Produce something every day",
    body: "Saying and writing one line is where you find out what you can't do yet, and that's the part worth fixing. Mistakes become tomorrow's cards.",
  },
];

const FAQ: readonly { readonly q: string; readonly a: (language: string) => string }[] = [
  { q: "Do I need an account?", a: () => "No. You can try a full page without one. Sign in afterwards to keep your streak, your words and your level." },
  { q: "Is it free?", a: () => "Yes. The daily page, reminders, groups and the natural voice are free." },
  { q: "How long does it take?", a: () => "About ten minutes. You can choose a longer daily time and get extra steps like dictation and real-speed listening." },
  {
    q: "What level do I need?",
    a: (language) => `Any. You pick from A1 (starting from zero) to B2 (comfortable, want polish), and the ${language} scenes match it. You can change it whenever you like.`,
  },
  {
    q: "What about the voice?",
    a: (language) =>
      `It uses your device's ${language} voice by default. You can switch on a free natural voice that runs on your own device: a one-time download of about 95 MB, and then it works offline.`,
  },
  { q: "Can I use it on my phone?", a: () => "Yes. It installs like an app from your browser and opens straight to today's page." },
];

export function LearnLanding({ content }: { readonly content: LandingContent }): ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none min-h-screen bg-(--bg) text-(--ink)">
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 border-b border-(--rule)">
        <div className="max-w-(--maxw) mx-auto px-(--gutter) flex flex-col gap-6">
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground flex-wrap">
            <span className="font-semibold text-(--ink)">{content.appName}</span>
            <span className="text-(--rule)">·</span>
            <span className="text-(--v3-accent) font-medium">One page a day</span>
            <span className="text-(--rule)">·</span>
            <span>About ten minutes</span>
          </div>
          <h1 className="m-0 font-display font-normal text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-tight text-(--ink) fvs-display text-balance max-w-[18ch]">
            {content.headline} <em className="not-italic italic text-(--v3-accent) fvs-soft">{content.headlineEm}</em>
          </h1>
          <p className="m-0 text-base sm:text-lg lg:text-xl text-secondary-foreground leading-relaxed max-w-[60ch]">{content.intro}</p>
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <MagneticWrapper strength={15}>
              <Link
                href={`/${content.app}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-mono text-xs tracking-wider font-semibold bg-(--ink) text-(--bg) no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              >
                Start today&apos;s page <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticWrapper>
            <span className="font-mono text-xs text-muted-foreground">Free · No account needed to try</span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-(--rule)" aria-labelledby="how">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          <h2 id="how" className="m-0 mb-10 font-display font-normal text-3xl sm:text-4xl leading-tight tracking-tight fvs-display">
            What a page looks like
          </h2>
          <ol className="m-0 p-0 list-none grid gap-px bg-(--rule) border border-(--rule) rounded-2xl overflow-hidden sm:grid-cols-2">
            {content.steps.map((step, i) => (
              <li key={step.name} className="bg-(--bg) p-6 sm:p-8 flex flex-col gap-2">
                <span className="font-mono text-xs text-(--v3-accent) font-semibold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="m-0 text-xl font-semibold text-(--ink)">{step.name}</h3>
                <p className="m-0 text-base text-secondary-foreground leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-(--rule)" aria-labelledby="why">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          <h2 id="why" className="m-0 mb-10 font-display font-normal text-3xl sm:text-4xl leading-tight tracking-tight fvs-display">
            Why this order works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {WHY.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <h3 className="m-0 text-lg font-semibold text-(--ink) flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1.5 shrink-0 text-(--v3-accent)" aria-hidden="true" />
                  {item.title}
                </h3>
                <p className="m-0 text-base text-secondary-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 mb-0 text-base text-secondary-foreground max-w-[60ch]">No magic multiplier: about ten focused minutes, every day, is what moves you.</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-(--rule)" aria-labelledby="faq">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          <h2 id="faq" className="m-0 mb-10 font-display font-normal text-3xl sm:text-4xl leading-tight tracking-tight fvs-display">
            Questions
          </h2>
          <dl className="m-0 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-(--ink)">{item.q}</dt>
                <dd className="m-0 mt-1 text-base text-secondary-foreground leading-relaxed">{item.a(content.language)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-(--maxw) mx-auto px-(--gutter) flex items-center justify-between gap-6 flex-wrap">
          <Link
            href={`/${content.app}`}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-mono text-xs tracking-wider font-semibold bg-(--ink) text-(--bg) no-underline transition-all duration-200 hover:opacity-90"
          >
            Start today&apos;s page <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={content.other.href} className="font-mono text-xs text-muted-foreground underline underline-offset-4 hover:text-(--ink)">
            {content.other.label}
          </Link>
        </div>
      </section>
    </main>
  );
}
