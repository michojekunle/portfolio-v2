/**
 * Natural voices (Plus): Google Cloud Text-to-Speech neural voices, cached in
 * a private bucket by content hash so each line is synthesised once, ever.
 * Learners receive short-lived signed URLs.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { FrenchDomainError } from "./errors";

export class TtsUnavailableError extends FrenchDomainError {}

/** One natural neural voice per accent. Change here to switch voices. */
export const NEURAL_VOICES: Record<string, { readonly languageCode: string; readonly name: string }> = {
  "fr-FR": { languageCode: "fr-FR", name: "fr-FR-Neural2-A" },
  "es-ES": { languageCode: "es-ES", name: "es-ES-Neural2-A" },
  "es-MX": { languageCode: "es-US", name: "es-US-Neural2-A" },
};

const BUCKET = "learn-tts";
const SIGNED_SECONDS = 60 * 60 * 24;

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function synthesize(text: string, locale: string, rate: number): Promise<Uint8Array> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  const voice = NEURAL_VOICES[locale];
  if (!key || !voice) throw new TtsUnavailableError("Natural voices are not configured for this accent.");
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice,
      audioConfig: { audioEncoding: "MP3", speakingRate: rate },
    }),
  });
  if (!response.ok) throw new TtsUnavailableError(`Text-to-speech failed with ${response.status}`);
  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) throw new TtsUnavailableError("Text-to-speech returned no audio.");
  return Uint8Array.from(Buffer.from(data.audioContent, "base64"));
}

/** Signed URL to an MP3 of `text` in the given accent and speed, synthesising and caching it on first request. */
export async function naturalVoiceUrl(admin: SupabaseClient, text: string, locale: string, rate: number): Promise<string> {
  const roundedRate = Math.round(rate * 20) / 20; // 0.05 steps keep the cache small
  const path = `${locale}/${roundedRate}/${await sha256(`${locale}|${roundedRate}|${text}`)}.mp3`;

  const existing = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_SECONDS);
  if (!existing.error && existing.data?.signedUrl) return existing.data.signedUrl;

  const audio = await synthesize(text, locale, roundedRate);
  const upload = await admin.storage.from(BUCKET).upload(path, audio, { contentType: "audio/mpeg", upsert: true });
  if (upload.error) throw new TtsUnavailableError(`Caching audio failed: ${upload.error.message}`);
  const signed = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_SECONDS);
  if (signed.error || !signed.data?.signedUrl) throw new TtsUnavailableError("Signing audio failed.");
  return signed.data.signedUrl;
}
