import {
  FIVE_PART_STRUCTURE,
  PREM_GUIDE,
  SPEAKING_FORMATS,
  SPEAKING_PRINCIPLES,
} from "@/lib/speaking/methodology";

export function MethodologyView(): React.ReactElement {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="space-y-2 pb-4 sm:pb-6 border-b border-(--rule)">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
          Reference Guide · Communication Craft
        </div>
        <h1 className="font-display text-[clamp(1.65rem,3.5vw,2.75rem)] font-normal text-(--ink) m-0">
          The Speaking Methodology
        </h1>
        <p className="text-sm text-(--ink-2) max-w-[62ch] m-0 leading-relaxed">
          A repeatable framework for turning raw technical, business, and personal curiosity into natural, persuasive spoken communication—without sounding scripted.
        </p>
      </header>

      {/* A. PREM */}
      <section className="space-y-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
            Part A · Organising Ideas
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-normal text-(--ink) mt-1 mb-0">
            PREM: Point → Reason → Example → Meaning
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREM_GUIDE.map((item) => (
            <div
              key={item.letter}
              className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-5 space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] bg-(--ink) text-(--bg) font-mono text-xs font-medium shrink-0">
                  {item.letter}
                </span>
                <div>
                  <h3 className="font-display text-lg font-normal text-(--ink) m-0">
                    {item.name}
                  </h3>
                  <p className="text-xs text-(--ink-2) m-0">{item.question}</p>
                </div>
              </div>
              <p className="text-sm text-(--ink-2) leading-relaxed m-0">
                {item.guidance}
              </p>
              <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3 text-xs text-(--ink) italic">
                &ldquo;{item.example}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B. Five-Part Speaking Structure */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
            Part B · Talk Architecture
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-normal text-(--ink) mt-1 mb-0">
            {FIVE_PART_STRUCTURE.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FIVE_PART_STRUCTURE.parts.map((part) => (
            <div
              key={part.step}
              className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3.5 sm:p-4 space-y-1.5"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
                0{part.step}
              </div>
              <div className="font-display text-base text-(--ink)">{part.name}</div>
              <p className="text-xs text-(--ink-2) leading-relaxed m-0">
                {part.description}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 sm:p-5 space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
            Worked Example · {FIVE_PART_STRUCTURE.workedExample.topic}
          </div>
          <div className="space-y-2 text-sm text-(--ink-2) leading-relaxed">
            <p className="m-0">
              <strong className="text-(--ink)">Hook:</strong> &ldquo;{FIVE_PART_STRUCTURE.workedExample.hook}&rdquo;
            </p>
            <p className="m-0">
              <strong className="text-(--ink)">Context:</strong> {FIVE_PART_STRUCTURE.workedExample.context}
            </p>
            <p className="m-0">
              <strong className="text-(--ink)">Main idea:</strong> {FIVE_PART_STRUCTURE.workedExample.mainIdea}
            </p>
            <p className="m-0">
              <strong className="text-(--ink)">Evidence / Story:</strong> {FIVE_PART_STRUCTURE.workedExample.example}
            </p>
            <p className="m-0">
              <strong className="text-(--ink)">Takeaway:</strong> {FIVE_PART_STRUCTURE.workedExample.takeaway}
            </p>
          </div>
        </div>
      </section>

      {/* C. Six Speaking Formats */}
      <section className="space-y-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
            Part C · Delivery Modes
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-normal text-(--ink) mt-1 mb-0">
            Six Speaking Formats
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPEAKING_FORMATS.map((fmt) => (
            <div
              key={fmt.id}
              className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-5 space-y-2.5"
            >
              <h3 className="font-display text-lg font-normal text-(--ink) m-0">
                {fmt.label}
              </h3>
              <p className="text-xs text-(--ink-2) leading-relaxed m-0">
                {fmt.shortDesc}
              </p>
              <p className="text-xs text-(--ink) leading-relaxed m-0">
                {fmt.howToExecute}
              </p>
              <div className="pt-2 border-t border-(--rule-2) text-[11px] text-(--ink-2) italic">
                {fmt.exampleAngle}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* D. Speaking Principles */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
            Part D · Non-Negotiable Principles
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-normal text-(--ink) mt-1 mb-0">
            Core Speaking Principles
          </h2>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 m-0 p-0 list-none">
          {SPEAKING_PRINCIPLES.map((principle, idx) => (
            <li
              key={principle}
              className="flex items-start gap-2.5 rounded-[4px] border border-(--rule-2) bg-(--bg) p-3 text-sm text-(--ink)"
            >
              <span className="font-mono text-[11px] text-(--ink-2) mt-0.5 tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
