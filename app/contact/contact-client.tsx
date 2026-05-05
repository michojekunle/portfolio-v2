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
        <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">05 — CONTACT · BOOKING</div>
          <h1 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance [font-variation-settings:'opsz'_144]">
            Let&apos;s <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">build.</em>
          </h1>
          <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
            Pick a slot below or send a note. Open to contract work, full-time roles in
            protocol-adjacent teams, and conversations that aren&apos;t either.
          </p>
        </section>

        <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[120px] max-[720px]:py-[72px]">
          <div className="v3-booking-section">
            {/* Calendar card */}
            <div className="v3-calendar-card">
              <div className="v3-calendar-head">
                <h4 className="flex items-center gap-3">
                  Pick a time
                  <span className="v3-calendar-tz">Lagos (GMT+1)</span>
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
                  
                  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                  const classes = ["day"]
                  if (day.past) classes.push("past")
                  if (day.isToday) classes.push("today")
                  if (isWeekend || day.past) classes.push("unavail")
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
                  <button
                    onClick={() => {
                      const [hh, mm] = selectedSlot.split(":").map(Number);
                      // Michael is in Lagos (UTC+1). We treat the selection as Lagos time
                      // and convert to UTC by subtracting 1 hour. Lagos does not use DST.
                      const y = selectedDate.getFullYear();
                      const m = selectedDate.getMonth();
                      const day = selectedDate.getDate();
                      const utcDate = new Date(Date.UTC(y, m, day, hh - 1, mm));
                      window.open(`https://cal.com/devvmichael/${meetingType}min?slot=${utcDate.toISOString()}`, "_blank");
                    }}
                    className="v3-btn v3-btn-accent v3-btn-sm"
                  >
                    Confirm {selectedSlot} · {meetingType}m <span className="arr" aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button className="v3-btn v3-btn-accent v3-btn-sm" disabled>
                    Select a slot
                  </button>
                )}
              </div>
            </div>

            {/* Info column */}
            <div className="v3-booking-info">
              <p className="font-[family:var(--display-font)] italic text-[clamp(24px,3vw,34px)] leading-[1.2] text-[var(--ink)] mb-[48px] [font-variation-settings:'opsz'_96,'SOFT'_100]">
                Good conversations start with a clear problem. Tell me what you&apos;re building.
              </p>

              <div className="body">
                <div className="mb-[48px]">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] mb-[16px] font-bold">
                    Email
                  </div>
                  <a href="mailto:michojekunle1@gmail.com" className="text-[22px] font-[family:var(--display-font)] text-[var(--v3-accent)] no-underline hover:underline [font-variation-settings:'opsz'_96]">
                    michojekunle1@gmail.com
                  </a>
                  <p className="text-[14px] font-mono tracking-tight text-[var(--ink-3)] mt-[10px]">Lagos, Nigeria · WAT (UTC+1)</p>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer" className="v3-social-chip">
                    GitHub <span className="arr" style={{ fontSize: '9px' }}>↗</span>
                  </a>
                  <a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer" className="v3-social-chip">
                    Twitter <span className="arr" style={{ fontSize: '9px' }}>↗</span>
                  </a>
                  <a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer" className="v3-social-chip">
                    LinkedIn <span className="arr" style={{ fontSize: '9px' }}>↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-[120px] max-[720px]:py-[72px] bg-[var(--bg-2)] border-y border-[var(--rule)]">
          <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
            <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[12px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
              <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] pt-[18px]">06 — FAQS</div>
              <div>
                <h2 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance [font-variation-settings:'opsz'_144]">
                  Common <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">questions.</em>
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 max-[920px]:grid-cols-1 gap-x-[80px] gap-y-[48px]">
              {FAQS.map((faq, i) => (
                <div key={i} className="group">
                  <h4 className="font-[family:var(--display-font)] font-normal text-[22px] leading-[1.3] text-[var(--ink)] mb-[16px] [font-variation-settings:'opsz'_96] group-hover:text-[var(--v3-accent)] transition-colors">
                    {faq.q}
                  </h4>
                  <p className="text-[15px] text-[var(--ink-2)] leading-[1.65] m-0 max-w-[48ch]">
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
