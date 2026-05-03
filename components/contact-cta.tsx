"use client"

import { useState } from "react"

type FormState = "idle" | "loading" | "success" | "error"

export function ContactCTA(): React.ReactElement {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [state, setState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setState("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = (await res.json()) as { success: boolean; message?: string }
      if (!res.ok) throw new Error(json.message ?? "Failed to send message")
      setState("success")
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch (err: unknown) {
      setState("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <section className="v3-contact-cta">
      <div className="v3-container">
        <div className="v3-cta-inner">

          {/* Left: CTA */}
          <div className="v3-cta-left">
            <div className="v3-eyebrow" style={{ marginBottom: 24 }}>
              <span className="dot" aria-hidden="true" /> Open to work
            </div>
            <h2>
              Let&apos;s build <em>something.</em>
            </h2>
            <p>
              Available for contract work, full-time roles in protocol-adjacent teams, and
              conversations that are neither.
            </p>
            <div className="v3-cta-actions">
              <a
                href="/contact"
                className="v3-btn v3-btn-accent"
              >
                Book a call <span className="arr" aria-hidden="true">→</span>
              </a>
              <a href="mailto:michojekunle1@gmail.com" className="v3-btn v3-btn-ghost">
                Email directly
              </a>
            </div>
            <div className="v3-cta-links">
              <a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
              <a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer">
                Twitter ↗
              </a>
              <a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <form className="v3-cta-form" onSubmit={handleSubmit} noValidate>
            <div className="v3-cta-form-row">
              <div className="v3-cta-field">
                <label htmlFor="cta-name">Name</label>
                <input
                  id="cta-name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={update("name")}
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                />
              </div>
              <div className="v3-cta-field">
                <label htmlFor="cta-email">Email</label>
                <input
                  id="cta-email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={update("email")}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="v3-cta-field">
              <label htmlFor="cta-subject">Subject</label>
              <input
                id="cta-subject"
                type="text"
                placeholder="What's this about?"
                value={form.subject}
                onChange={update("subject")}
                required
                minLength={2}
                maxLength={200}
              />
            </div>

            <div className="v3-cta-field">
              <label htmlFor="cta-message">Message</label>
              <textarea
                id="cta-message"
                placeholder="Tell me what you're building..."
                value={form.message}
                onChange={update("message")}
                required
                minLength={10}
                maxLength={1000}
                rows={5}
              />
            </div>

            {state === "success" ? (
              <div className="v3-cta-success">
                Message sent. I&apos;ll be in touch within 24 hours.
              </div>
            ) : (
              <>
                {state === "error" && (
                  <div className="v3-cta-error">{errorMsg}</div>
                )}
                <button
                  type="submit"
                  className="v3-btn v3-btn-primary"
                  disabled={state === "loading"}
                >
                  {state === "loading" ? "Sending…" : "Send message →"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
