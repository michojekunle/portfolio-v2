"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BBSettings, AIProvider } from "@/lib/bookbreaks/types";
import { TONE_OPTIONS } from "@/lib/bookbreaks/constants";

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
      });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  const sectionStyle = {
    background: "#FAF5EC",
    border: "1px solid #D4B896",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[16px]">
      {/* Website */}
      <section style={sectionStyle}>
        <SectionTitle>Website & Branding</SectionTitle>
        <Field label="Your Website URL">
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="www.michaelojekunle.dev"
            className="bb-settings-input"
          />
          <p className="font-mono text-[10px] mt-[6px] m-0" style={{ color: "#8B6F47" }}>
            This URL is included in all generated content CTAs.
          </p>
        </Field>
        <Field label="Newsletter / Follow CTA (optional)">
          <input
            type="text"
            value={newsletterCta}
            onChange={(e) => setNewsletterCta(e.target.value)}
            placeholder="Subscribe at newsletter.michaelojekunle.dev"
            className="bb-settings-input"
          />
        </Field>
      </section>

      {/* AI */}
      <section style={sectionStyle}>
        <SectionTitle>AI Generation</SectionTitle>
        <Field label="Preferred AI Provider">
          <div className="flex gap-[8px]">
            {[
              { value: "auto", label: "Auto", desc: "Best tool per content type" },
              { value: "groq", label: "Groq", desc: "Fastest (Llama 3.1)" },
              { value: "gemini", label: "Gemini", desc: "Google Gemini 1.5" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAiProvider(p.value as AIProvider)}
                className="flex-1 py-[10px] px-[12px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.08em] cursor-pointer border-none transition-all"
                style={{
                  background:
                    aiProvider === p.value
                      ? "rgba(200,90,44,0.12)"
                      : "rgba(44,44,44,0.05)",
                  color: aiProvider === p.value ? "#C85A2C" : "#4A3728",
                  outline:
                    aiProvider === p.value
                      ? "1.5px solid rgba(200,90,44,0.3)"
                      : "none",
                }}
              >
                <div className="font-semibold">{p.label}</div>
                <div
                  className="text-[8px] normal-case tracking-normal mt-[2px] opacity-70"
                  style={{ textTransform: "none", letterSpacing: "0" }}
                >
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Default Tone">
          <select
            value={defaultTone}
            onChange={(e) => setDefaultTone(e.target.value)}
            className="bb-settings-input"
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Default Article Word Count">
          <input
            type="number"
            value={defaultWordCount}
            onChange={(e) => setDefaultWordCount(Number(e.target.value))}
            min={500}
            max={3000}
            step={100}
            className="bb-settings-input"
          />
        </Field>
      </section>

      {/* SEO */}
      <section style={sectionStyle}>
        <SectionTitle>SEO Defaults</SectionTitle>
        <Field label="Default SEO Keywords (comma-separated)">
          <input
            type="text"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            placeholder="learning in public, book review, entrepreneurship"
            className="bb-settings-input"
          />
          <p className="font-mono text-[10px] mt-[6px] m-0" style={{ color: "#8B6F47" }}>
            These are included in article generation prompts automatically.
          </p>
        </Field>
      </section>

      {error && (
        <div
          className="rounded-[8px] px-[14px] py-[10px] font-mono text-[11px]"
          style={{
            background: "rgba(220,38,38,0.08)",
            color: "#DC2626",
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full h-[52px] rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90"
        style={{ background: saved ? "#2D5016" : "#C85A2C" }}
      >
        {saving ? "Saving…" : saved ? "✓ Saved" : "Save Settings"}
      </button>

      <style>{`
        .bb-settings-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
          background: #F5E6D3;
          border: 1.5px solid #D4B896;
          color: #2C2C2C;
        }
        .bb-settings-input:focus { border-color: #C85A2C; }
      `}</style>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div
      className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[20px]"
      style={{ color: "#8B6F47" }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mb-[16px] last:mb-0">
      <label
        className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"
        style={{ color: "#8B6F47" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
