import type { BBBook, ContentType, GenerateRequest } from "./types";
import { DEFAULT_WEBSITE_URL } from "./constants";

const SHARED_CONTEXT = (book: BBBook, websiteUrl: string): string => `
Book: "${book.title}" by ${book.author}
Website: ${websiteUrl}
Author: Michael Ojekunle — Full-Stack & Web3 developer from Lagos, Nigeria. Builds in public and shares what he learns. Follow on X @devvmichael.

Key Insights from the book:
${book.insights.map((ins, i) => `${i + 1}. ${ins}`).join("\n")}
`.trim();

export function buildSystemPrompt(contentType: ContentType): string {
  const systems: Record<ContentType, string> = {
    article: `You are an expert content writer who specialises in book summaries and educational long-form content.
Write SEO-optimised, deeply engaging articles that educate readers while maintaining a warm, community-focused tone.
Use specific examples, real-world applications, and a first-person perspective.
Structure: compelling intro with personal hook → 3 key insights with H2 headings → biggest takeaway → "Should You Read?" section → CTA linking to the author's website.
Output plain Markdown. No preamble, no meta-commentary — just the article.`,

    thread: `You are an expert at crafting viral X/Twitter threads that deliver genuine value.
Stop the scroll with a powerful hook, then teach through a numbered thread. Use short punchy sentences.
Each tweet should stand alone but create curiosity for the next. End with a strong personal takeaway + CTA.
Format: Number each tweet with "1/" "2/" etc. Include a line break between each tweet.
Tweet 1 is the hook. Tweets 2–9 are insights. Tweet 10 is the personal reflection. Tweet 11 is the CTA.
Output plain text. No preamble.`,

    carousel: `You are designing Instagram carousel slide content for a creator who shares book insights.
Each slide = one insight. Write punchy, visually scannable content.
Slide 1: Hook headline + question. Slides 2–5: One insight per slide (headline + 2–3 bullet points). Slide 6: CTA with website link.
Format slides as:
SLIDE 1
Headline: [text]
Subtext: [text]

SLIDE 2
Headline: [text]
Bullet 1: [text]
Bullet 2: [text]
Bullet 3: [text]

Continue this pattern. Keep all text punchy and short — this is a visual medium.
Output plain text. No preamble.`,

    tiktok: `You are scripting a 60-second TikTok video about a book. Be direct, fast, and value-packed.
The creator speaks on camera. Include timing cues, text overlay suggestions, and B-roll ideas.
Structure: [0–5s] HOOK — bold statement. [5–40s] MAIN INSIGHTS — 3 concepts with examples. [40–55s] TRANSFORMATION — what changed. [55–60s] CTA — website link.
Format:
[0–5s] HOOK
Script: [what to say]
Text overlay: [on-screen text]

[5–20s] INSIGHT 1
Script: [what to say]
Text overlay: [on-screen text]
B-roll: [visual suggestion]

Continue this pattern for all sections.
Output plain text. No preamble.`,

    caption: `You are writing a social media caption for a creator who shares book insights.
Write in first person, warm and authentic. Start with a hook, share 3–5 insights with emojis,
add a personal reflection, end with an engagement question + website CTA + hashtags.
Keep it conversational, not corporate.
Output plain text. No preamble.`,
  };

  return systems[contentType];
}

export function buildUserPrompt(
  book: BBBook,
  request: GenerateRequest,
  websiteUrl = DEFAULT_WEBSITE_URL
): string {
  const context = SHARED_CONTEXT(book, websiteUrl);
  const tone = request.tone ?? "educational";
  const wordCount = request.word_count ?? 1500;
  const keywords = request.seo_keywords?.join(", ") ?? "";

  const instructions: Record<ContentType, string> = {
    article: `Write a ${wordCount}-word, SEO-optimised blog article about "${book.title}" by ${book.author}.
Tone: ${tone}
${keywords ? `Target keywords (weave in naturally): ${keywords}` : ""}
${request.custom_instructions ? `Additional instructions: ${request.custom_instructions}` : ""}
Include a meta description suggestion at the top in the format: **Meta:** [155 chars]
End with a CTA linking to ${websiteUrl}

${context}`,

    thread: `Write an 11-tweet X thread about "${book.title}" by ${book.author}.
Tone: ${tone}
${request.custom_instructions ? `Additional instructions: ${request.custom_instructions}` : ""}
Tag @${book.author.split(" ").join("")} in tweet 1 if relevant.
Final tweet CTA should link to ${websiteUrl}

${context}`,

    carousel: `Write a 6-slide Instagram carousel about "${book.title}" by ${book.author}.
Tone: ${tone}
${request.custom_instructions ? `Additional instructions: ${request.custom_instructions}` : ""}
Final slide CTA: ${websiteUrl}

${context}`,

    tiktok: `Write a 60-second TikTok script about "${book.title}" by ${book.author}.
Tone: ${tone}
${request.custom_instructions ? `Additional instructions: ${request.custom_instructions}` : ""}
End CTA: ${websiteUrl}

${context}`,

    caption: `Write an Instagram/X caption about "${book.title}" by ${book.author}.
Platform: ${request.platform ?? "Instagram"}
Tone: ${tone}
${request.custom_instructions ? `Additional instructions: ${request.custom_instructions}` : ""}
CTA links to: ${websiteUrl}/books

${context}`,
  };

  return instructions[request.content_type];
}
