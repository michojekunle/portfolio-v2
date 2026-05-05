"use client"

import { useState } from "react"

const MEETING_TYPES = [
  { id: "15", label: "15 min", desc: "Quick chat" },
  { id: "30", label: "30 min", desc: "Project brief" },
  { id: "60", label: "60 min", desc: "Deep dive" },
] as const

const SLOTS = ["09:00", "09:30", "10:00", "11:00", "14:00", "14:30", "15:30", "16:00", "17:00"]
const DAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"]

const FAQS = [
  { q: "Are you open to full-time roles?", a: "Yes — specifically protocol-adjacent teams, infrastructure, or zkML research. DM or email first." },
  { q: "What timezone are you in?", a: "WAT (UTC+1). Lagos, Nigeria. I keep Lagos hours but can do early morning slots for overlap." },
  { q: "Do you take freelance projects?", a: "Selectively. I'm most useful for web3 frontend, smart contract audits, and greenfield Next.js apps." },
  { q: "What's your response time?", a: "Usually within 24 hours on weekdays. Faster if it's interesting." },
]

export function ContactPage(): React.ReactElement {
  const [meetingType, setMeetingType] = useState("30")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [monthOffset, setMonthOffset] = useState(0)

  const today = new Date()
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const monthName = viewDate.toLocaleString("en", { month: "long", year: "numeric" })
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDay = (viewDate.getDay() + 6) % 7

  type DayCell =
    | { empty: true }
    | { empty: false; d: number; date: Date; past: boolean; hasSlots: boolean; isToday: boolean }

  const days: DayCell[] = []
  for (let i = 0; i < firstDay; i++) days.push({ empty: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d)
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    days.push({ empty: false, d, date, past: isPast, hasSlots: !isPast && !isWeekend, isToday: date.toDateString() === today.toDateString() })
  }

  const isSelected = (date: Date) => selectedDate?.toDateString() === date.toDateString()

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="v3-util-hero v3-container">
          <div className="v3-eyebrow" style={{ marginBottom: 24 }}>
            <span className="dot" aria-hidden="true" /> Available · response within 24h
          </div>
          <h1>
            Let&apos;s <em>build.</em>
          </h1>
          <p>
            Pick a slot below or send a note. Open to contract work, full-time roles in
            protocol-adjacent teams, and conversations that aren&apos;t either.
          </p>
        </section>

        <section className="v3-container" style={{ paddingBottom: 80 }}>
          <div className="v3-booking-section">
            {/* Calendar card */}
            <div className="v3-calendar-card">
              <div className="v3-calendar-head">
                <h4>
                  Pick a time
                  <span className="v3-calendar-tz">WAT (UTC+1)</span>
                </h4>
                <div className="v3-calendar-nav">
                  <button onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))} disabled={monthOffset === 0} aria-label="Previous month">‹</button>
                  <span className="month">{monthName}</span>
                  <button onClick={() => setMonthOffset(monthOffset + 1)} aria-label="Next month">›</button>
                </div>
              </div>

              {/* Meeting type */}
              <div className="v3-calendar-types">
                {MEETING_TYPES.map((t) => (
                  <button
                    key={t.id}
                    className={meetingType === t.id ? "active" : ""}
                    onClick={() => setMeetingType(t.id)}
                  >
                    <div className="dur">{t.label}</div>
                    <div className="lbl">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="v3-calendar-grid">
                {DAY_NAMES.map((dn, i) => (
                  <div key={`dn-${i}`} className="dn">{dn}</div>
                ))}
                {days.map((day, i) => {
                  if (day.empty) return <div key={`empty-${i}`} className="day empty" />
                  const classes = ["day"]
                  if (day.past) classes.push("past")
                  if (day.isToday) classes.push("today")
                  if (!day.hasSlots || day.past) classes.push("unavail")
                  if (isSelected(day.date)) classes.push("selected")

                  return (
                    <button
                      key={day.d}
                      className={classes.join(" ")}
                      disabled={!day.hasSlots || day.past}
                      onClick={() => { setSelectedDate(day.date); setSelectedSlot(null) }}
                      aria-label={`${day.date.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}${day.hasSlots && !day.past ? "" : " — unavailable"}`}
                    >
                      {day.d}
                    </button>
                  )
                })}
              </div>

              {/* Slots */}
              {selectedDate && (
                <div className="v3-calendar-slots">
                  <div className="lbl">
                    Available slots · {selectedDate.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
                  </div>
                  <div className="slots-grid">
                    {SLOTS.map((s) => (
                      <button
                        key={s}
                        className={`v3-slot${selectedSlot === s ? " selected" : ""}`}
                        onClick={() => setSelectedSlot(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="v3-calendar-actions">
                <a
                  href="https://cal.com/devvmichael"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v3-btn v3-btn-ghost v3-btn-sm"
                >
                  Open Cal.com ↗
                </a>
                {selectedDate && selectedSlot ? (
                  <a
                    href={`https://cal.com/devvmichael/${meetingType}min`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v3-btn v3-btn-accent v3-btn-sm"
                  >
                    Confirm {selectedSlot} · {meetingType}m <span className="arr" aria-hidden="true">→</span>
                  </a>
                ) : (
                  <button className="v3-btn v3-btn-accent v3-btn-sm" disabled>
                    Select a slot
                  </button>
                )}
              </div>
            </div>

            {/* Info column */}
            <div className="v3-booking-info">
              <p
                style={{
                  fontFamily: "var(--display-font)",
                  fontStyle: "italic",
                  fontSize: "clamp(22px, 2.4vw, 30px)",
                  lineHeight: 1.25,
                  color: "var(--ink)",
                  margin: "0 0 40px",
                  fontVariationSettings: '"opsz" 96, "SOFT" 100',
                }}
              >
                Good conversations start with a clear problem. Tell me what you&apos;re building.
              </p>

              <div className="body">
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>
                    Contact
                  </div>
                  <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 8px" }}>
                    <a href="mailto:michojekunle1@gmail.com" style={{ color: "var(--v3-accent)" }}>
                      michojekunle1@gmail.com
                    </a>
                  </p>
                  <p style={{ fontSize: 15, color: "var(--ink-2)", margin: 0 }}>Lagos, Nigeria · WAT (UTC+1)</p>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer" className="v3-btn v3-btn-ghost v3-btn-sm">GitHub</a>
                  <a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer" className="v3-btn v3-btn-ghost v3-btn-sm">Twitter</a>
                  <a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer" className="v3-btn v3-btn-ghost v3-btn-sm">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="v3-accent-section" style={{ padding: "80px 0" }}>
          <div className="v3-container">
            <div className="v3-section-head" style={{ marginBottom: 48 }}>
              <div className="num">FAQ</div>
              <h2>Common <em>questions.</em></h2>
            </div>
            <div className="v3-faq-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ padding: "28px", borderLeft: "2px solid var(--v3-accent-soft)" }}>
                  <h4 style={{ fontFamily: "var(--display-font)", fontVariationSettings: '"opsz" 96', fontSize: "20px", fontWeight: 400, color: "var(--ink)", margin: "0 0 12px" }}>
                    {faq.q}
                  </h4>
                  <p style={{ fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
    </main>
  )
}
