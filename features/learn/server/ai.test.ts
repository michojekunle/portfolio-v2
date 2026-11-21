import { afterEach, describe, expect, it, vi } from "vitest";
import { FRENCH, SPANISH } from "../domain/languages";
import { AiUnavailableError } from "./errors";

// The provider SDK is the boundary: make it fail the way Gemini does under load.
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(): { generateContent: () => Promise<never> } {
      return { generateContent: () => Promise.reject(new Error("[503 Service Unavailable] This model is currently experiencing high demand.")) };
    }
  },
}));

describe("AI calls", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("turns a provider 503 into AiUnavailableError so the session falls back instead of failing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const { generateLesson, gradeSentence } = await import("./ai");
    await expect(generateLesson(FRENCH, { level: "A2", topic: "ordering at a café", recycleWords: [] })).rejects.toBeInstanceOf(AiUnavailableError);
    await expect(gradeSentence(SPANISH, { sentence: "Je voudrais un café.", level: "A2", mode: "written" })).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
