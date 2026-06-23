import { NewsletterForm } from "./newsletter-form"

interface NewsletterCTAProps {
  title?: string
  description?: string
  compact?: boolean
}

export function NewsletterCTA({ 
  title = "Join the loop.", 
  description = "Short essays on engineering, ZK, and learning in public. Delivered when they're ready.",
  compact = false
}: NewsletterCTAProps): React.ReactElement {
  if (compact) {
    return (
      <div className="p-[24px] bg-[var(--bg-2)] border border-[var(--rule)] rounded-[16px]">
        <h4 className="m-0 font-display text-[20px] font-normal text-[var(--ink)] mb-[8px] fvs-text">{title}</h4>
        <p className="text-[14px] text-[var(--ink-2)] leading-[1.5] mb-[20px]">{description}</p>
        <NewsletterForm />
      </div>
    )
  }

  return (
    <div id="newsletter" className="py-[80px] px-[var(--gutter)] bg-[var(--bg-2)] border-y border-[var(--rule)] text-center">
      <div className="max-w-[500px] mx-auto flex flex-col items-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--v3-accent)] mb-[24px] font-bold">Newsletter</div>
        <h2 className="m-0 font-display text-[clamp(32px,5vw,48px)] font-normal text-[var(--ink)] leading-[1.1] tracking-[-0.03em] mb-[16px] fvs-display">
          {title}
        </h2>
        <p className="text-[17px] text-[var(--ink-2)] leading-[1.6] mb-[40px] text-balance">
          {description}
        </p>
        <NewsletterForm />
      </div>
    </div>
  )
}
