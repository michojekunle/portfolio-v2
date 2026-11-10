import { NewsletterForm } from "./newsletter-form"

interface NewsletterCTAProps {
  title?: string
  description?: string
  compact?: boolean
}

export function NewsletterCTA({ 
  title = "Join the loop.", 
  description = "Short essays on engineering, Rust and learning in public. Sent when they're ready.",
  compact = false
}: NewsletterCTAProps): React.ReactElement {
  if (compact) {
    return (
      <div className="p-6 bg-(--bg-2) border border-(--rule) rounded-2xl">
        <h4 className="m-0 font-display text-[20px] font-normal text-(--ink) mb-2 fvs-text">{title}</h4>
        <p className="text-[14px] text-secondary-foreground leading-normal mb-5">{description}</p>
        <NewsletterForm />
      </div>
    )
  }

  return (
    <div id="newsletter" className="py-20 px-(--gutter) bg-(--bg-2) border-y border-(--rule) text-center">
      <div className="max-w-[500px] mx-auto flex flex-col items-center">
        <h2 className="m-0 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-(--ink) leading-[1.1] tracking-[-0.03em] mb-4 fvs-display">
          {title}
        </h2>
        <p className="text-base text-secondary-foreground leading-[1.6] mb-10 text-balance">
          {description}
        </p>
        <NewsletterForm />
      </div>
    </div>
  )
}
