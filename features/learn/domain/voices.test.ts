import { describe, expect, it } from "vitest";
import { FRENCH, SPANISH } from "./languages";
import { pickBestVoice } from "./voices";

const v = (name: string, lang: string): { name: string; lang: string } => ({ name, lang });

describe("pickBestVoice", () => {
  it("prefers France French over Canadian French, even when Canadian comes first", () => {
    const voices = [v("Amélie", "fr-CA"), v("Thomas", "fr-FR"), v("Samantha", "en-US")];
    expect(pickBestVoice(voices, FRENCH.speechLocale, FRENCH.voiceHints)).toEqual({ voice: voices[1], match: "native" });
  });

  it("prefers Spain Spanish over Mexican Spanish", () => {
    const voices = [v("Paulina", "es-MX"), v("Mónica", "es-ES")];
    expect(pickBestVoice(voices, SPANISH.speechLocale, SPANISH.voiceHints).voice?.name).toBe("Mónica");
  });

  it("never picks a novelty voice when a real one exists", () => {
    const voices = [v("Eloquence Jacques (French)", "fr-FR"), v("Google français", "fr-FR")];
    expect(pickBestVoice(voices, "fr-FR", FRENCH.voiceHints).voice?.name).toBe("Google français");
  });

  it("falls back to another region of the language, and says so", () => {
    expect(pickBestVoice([v("Amélie", "fr-CA")], "fr-FR", FRENCH.voiceHints).match).toBe("other-region");
  });

  it("reports no voice rather than reading French with an English one", () => {
    expect(pickBestVoice([v("Samantha", "en-US")], "fr-FR", FRENCH.voiceHints)).toEqual({ voice: null, match: "none" });
  });

  it("accepts underscore locales some Android browsers report", () => {
    expect(pickBestVoice([v("French France", "fr_FR")], "fr-FR", FRENCH.voiceHints).match).toBe("native");
  });
});
