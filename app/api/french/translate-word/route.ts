import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const runtime = "edge";

const DICT: Record<string, { en: string; partOfSpeech: string; note: string }> = {
  logique: { en: "logical / logic", partOfSpeech: "adjective", note: "Describes something coherent or reasonable (e.g., 'connecteur logique' = logical connector)" },
  connecteur: { en: "connector / transition word", partOfSpeech: "noun", note: "Masculine noun (un connecteur logique)" },
  intention: { en: "intention / intent", partOfSpeech: "noun", note: "Feminine noun (avoir l'intention de = to intend to)" },
  magnifique: { en: "magnificent / beautiful", partOfSpeech: "adjective", note: "Adjective (un temps magnifique = wonderful weather)" },
  arrivé: { en: "arrived / arrival", partOfSpeech: "verb", note: "Past participle of arriver (après être arrivé = after arriving)" },
  arrivée: { en: "arrived / arrival", partOfSpeech: "verb / noun", note: "Feminine past participle / noun (l'arrivée)" },
  temps: { en: "weather / time", partOfSpeech: "noun", note: "Masculine noun (il faisait un temps magnifique)" },
  faisait: { en: "was making / was doing", partOfSpeech: "verb", note: "Imperfect tense of faire (il faisait un temps...)" },
  rendre: { en: "to render / return", partOfSpeech: "verb", note: "Infinitive verb (se rendre compte de = to realize)" },
  compte: { en: "account / realization", partOfSpeech: "noun", note: "Masculine noun (se rendre compte = to realize)" },
  coup: { en: "blow / stroke", partOfSpeech: "noun", note: "Masculine noun ('du coup' = so / as a result)" },
  rédaction: { en: "writing / drafting", partOfSpeech: "noun", note: "Feminine noun (guide de rédaction)" },
  guide: { en: "guide / handbook", partOfSpeech: "noun", note: "Masculine noun (un guide)" },
  expressions: { en: "expressions / phrases", partOfSpeech: "noun", note: "Plural feminine noun (des expressions)" },
  expression: { en: "expression / phrase", partOfSpeech: "noun", note: "Feminine noun (une expression)" },
  cibles: { en: "target / target words", partOfSpeech: "noun / adj", note: "Plural feminine noun (mots cibles)" },
  cible: { en: "target", partOfSpeech: "noun", note: "Feminine noun (la cible)" },
  obligatoirement: { en: "mandatory / compulsorily", partOfSpeech: "adverb", note: "Adverb derived from obligatoire" },
  inclure: { en: "to include", partOfSpeech: "verb", note: "Infinitive verb" },
  après: { en: "after", partOfSpeech: "preposition", note: "Preposition of time (après être arrivé = after arriving)" },
  être: { en: "to be", partOfSpeech: "verb", note: "Auxiliary infinitive verb" },
  avoir: { en: "to have", partOfSpeech: "verb", note: "Auxiliary infinitive verb" },
};

function inferPOS(word: string, en: string): string {
  const w = word.toLowerCase();
  const e = en.toLowerCase();
  if (w.endsWith("ment") || e.endsWith("ly")) return "adverb";
  if (w.endsWith("er") || w.endsWith("ir") || w.endsWith("re") || e.startsWith("to ")) return "verb";
  if (w.endsWith("ive") || w.endsWith("if") || w.endsWith("able") || w.endsWith("ique") || w.endsWith("al")) return "adjective";
  if (w.endsWith("tion") || w.endsWith("té") || w.endsWith("ence") || w.endsWith("ance")) return "noun";
  return "vocabulary term";
}

export async function POST(req: Request) {
  try {
    const { word } = (await req.json()) as { word?: string };
    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
    }

    const clean = word.toLowerCase().replace(/[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]/g, "").trim();
    if (!clean) {
      return NextResponse.json({ error: "Invalid word" }, { status: 400 });
    }

    // 1. Check instant dictionary
    if (DICT[clean]) {
      return NextResponse.json({ ok: true, word: clean, ...DICT[clean] });
    }

    const stripped = clean.replace(/^(j'|c'|l'|d'|m'|t'|s'|n'|qu')/i, "");
    if (DICT[stripped]) {
      return NextResponse.json({ ok: true, word: clean, ...DICT[stripped] });
    }

    // 2. Try Gemini 2.5 Flash for instant high-quality translation & learning note
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Translate the French word or expression "${clean}" into English for a language learner.
Return ONLY valid raw JSON with no markdown wrapping:
{
  "en": "concise English meaning",
  "partOfSpeech": "noun / verb / adjective / adverb / phrase",
  "note": "brief 1-sentence grammar or usage tip"
}`;

        const response = await model.generateContent(prompt);
        const text = response.response.text() || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as { en?: string; partOfSpeech?: string; note?: string };
          if (parsed.en) {
            return NextResponse.json({
              ok: true,
              word: clean,
              en: parsed.en.toLowerCase(),
              partOfSpeech: parsed.partOfSpeech || inferPOS(clean, parsed.en),
              note: parsed.note || `French vocabulary term: "${clean}"`,
            });
          }
        }
      } catch (err) {
        console.warn("[translate-word] Gemini fallback error:", err);
      }
    }

    // 3. Try Groq Llama 3.1 fallback
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const res = await groq.chat.completions.create({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "user",
              content: `Translate French word "${clean}" into English for a language learner. Return JSON: {"en": "...", "partOfSpeech": "...", "note": "..."}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const content = res.choices[0]?.message?.content || "";
        const parsed = JSON.parse(content) as { en?: string; partOfSpeech?: string; note?: string };
        if (parsed.en) {
          return NextResponse.json({
            ok: true,
            word: clean,
            en: parsed.en.toLowerCase(),
            partOfSpeech: parsed.partOfSpeech || inferPOS(clean, parsed.en),
            note: parsed.note || `French vocabulary term: "${clean}"`,
          });
        }
      } catch (err) {
        console.warn("[translate-word] Groq fallback error:", err);
      }
    }

    // 4. Free MyMemory API Fallback
    try {
      const mmRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=fr|en`);
      const mmData = (await mmRes.json()) as { responseData?: { translatedText?: string } };
      const translated = mmData.responseData?.translatedText;
      if (translated) {
        const enText = translated.toLowerCase();
        return NextResponse.json({
          ok: true,
          word: clean,
          en: enText,
          partOfSpeech: inferPOS(clean, enText),
          note: `Grammar note: French term "${clean}" translates to "${enText}".`,
        });
      }
    } catch {
      // Ignore
    }

    // Final fallback: clean POS inference
    return NextResponse.json({
      ok: true,
      word: clean,
      en: clean,
      partOfSpeech: inferPOS(clean, clean),
      note: `French term "${clean}". Tap 'Save to Vault' to bookmark.`,
    });
  } catch (err) {
    console.error("[translate-word] Server error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
