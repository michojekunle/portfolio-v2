"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BBSettings, AIProvider } from "@/lib/bookbreaks/types";
import { TONE_OPTIONS } from "@/lib/bookbreaks/constants";
import {
  Globe,
  Sparkles,
  Search,
  Zap,
  Check,
  User,
} from "lucide-react";

interface Props {
  initialSettings: BBSettings | null;
}

export function BBSettingsForm({ initialSettings }: Props): React.ReactElement {
  const supabase = createClient();

  const [websiteUrl, setWebsiteUrl] = useState(
    initialSettings?.website_url ?? "www.michaelojekunle.dev"
  );
  const [aiProvider, setAiProvider] = useState<AIProvider>(
    initialSettings?.ai_provider ?? "auto"
  );
  const [defaultTone, setDefaultTone] = useState(
    initialSettings?.default_tone ?? "educational"
  );
  const [defaultWordCount, setDefaultWordCount] = useState(
    initialSettings?.default_word_count ?? 1500
  );
  const [seoKeywords, setSeoKeywords] = useState(
    (initialSettings?.seo_keywords ?? []).join(", ")
  );
  const [newsletterCta, setNewsletterCta] = useState(
    initialSettings?.newsletter_cta ?? ""
  );
  const [authorBio, setAuthorBio] = useState(
    (initialSettings as any)?.author_bio ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from("bb_settings")
      .upsert({
        user_id: user.id,
        website_url: websiteUrl.trim(),
        ai_provider: aiProvider,
        default_tone: defaultTone,
        default_word_count: defaultWordCount,
        seo_keywords: seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        newsletter_cta: newsletterCta.trim(),
        author_bio: authorBio.trim(),
      });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  const AI_PROVIDERS = [
    { value: "auto", label: "Auto", desc: "Best model per task" },
    { value: "groq", label: "Groq", desc: "Fastest · Llama 3.1" },
    { value: "gemini", label: "Gemini", desc: "Google · 1.5 Flash" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

      {/* ─── Website & Branding ─────────────────────────────────── */}
      <SettingsSection icon={<Globe size={14} />} title="Website & Branding">
        <Field label="Your Website URL" hint="Included in all generated content CTAs.">
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="www.yoursite.dev"
            className="bb-input"
          />
        </Field>
        <Field label="Newsletter / Follow CTA" hint="Optional — appended to content as a call-to-action.">
          <input
            type="text"
            value={newsletterCta}
            onChange={(e) => setNewsletterCta(e.target.value)}
            placeholder="Subscribe at newsletter.yoursite.dev"
            className="bb-input"
          />
        </Field>
        <Field label="Author Bio" hint="Used to personalise AI-generated content with your voice.">
          <textarea
            value={authorBio}
            onChange={(e) => setAuthorBio(e.target.value)}
            placeholder="I'm a founder and builder who writes about books, business, and learning in public…"
            rows={3}
            className="bb-input"
            style={{ height: "auto", paddingTop: "12px", paddingBottom: "12px", resize: "vertical" }}
          />
        </Field>
      </SettingsSection>

      {/* ─── AI Generation ──────────────────────────────────────── */}
      <SettingsSection icon={<Sparkles size={14} />} title="AI Generation">
        <Field label="Preferred AI Provider">
          <div className="grid grid-cols-3 gap-2">
            {AI_PROVIDERS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAiProvider(p.value as AIProvider)}
                className={`flex flex-col items-start gap-0.75 py-2.5 px-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.08em] cursor-pointer border transition-all duration-150 ${
                  aiProvider === p.value
                    ? "border-(--v3-accent) bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-(--v3-accent)"
                    : "border-(--rule) bg-transparent text-muted-foreground hover:border-(--v3-accent) hover:text-secondary-foreground"
                }`}
              >
                <div className="font-semibold">{p.label}</div>
                <div className="text-[8px] normal-case tracking-normal opacity-60" style={{ letterSpacing: 0 }}>
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-3">
          <Field label="Default Tone">
            <select
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
              className="bb-input"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Default Word Count">
            <input
              type="number"
              value={defaultWordCount}
              onChange={(e) => setDefaultWordCount(Number(e.target.value))}
              min={500}
              max={3000}
              step={100}
              className="bb-input"
            />
          </Field>
        </div>
      </SettingsSection>

      {/* ─── SEO ────────────────────────────────────────────────── */}
      <SettingsSection icon={<Search size={14} />} title="SEO Defaults">
        <Field label="Default SEO Keywords" hint="Comma-separated · automatically injected into generation prompts.">
          <input
            type="text"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            placeholder="learning in public, book review, entrepreneurship"
            className="bb-input"
          />
        </Field>
      </SettingsSection>

      {/* ─── Error ──────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-mono text-[11px]"
          style={{
            background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
            color: "var(--v3-accent)",
            border: "1px solid color-mix(in oklab, var(--v3-accent) 25%, transparent)",
          }}
        >
          {error}
        </div>
      )}

      {/* ─── Submit ─────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={saving}
        className="w-full h-13 rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-(--bg) transition-all duration-200 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 flex items-center justify-center gap-2"
        style={{
          background: saved
            ? "color-mix(in oklab, #22c55e 60%, var(--v3-accent))"
            : "var(--v3-accent)",
        }}
      >
        {saving ? (
          <><Zap size={13} className="animate-pulse" /> Saving…</>
        ) : saved ? (
          <><Check size={13} /> Saved</>
        ) : (
          "Save Settings"
        )}
      </button>

      <style>{`
        .bb-input {
          width: 100%;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: color-mix(in oklab, var(--bg) 60%, var(--bg-2));
          border: 1.5px solid var(--rule);
          color: var(--ink);
          display: block;
        }
        .bb-input::placeholder { color: var(--ink-4); }
        .bb-input:focus {
          border-color: var(--v3-accent);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--v3-accent) 12%, transparent);
        }
        select.bb-input { cursor: pointer; }
      `}</style>
    </form>
  );
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--rule)", background: "color-mix(in oklab, var(--bg-2) 80%, var(--bg))" }}
      >
        <span className="text-(--v3-accent)">{icon}</span>
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && (
        <p className="font-mono text-[10px] m-0 text-(--ink-4) leading-normal">
          {hint}
        </p>
      )}
    </div>
  );
}
