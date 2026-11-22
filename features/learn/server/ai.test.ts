import { afterEach, describe, expect, it, vi } from "vitest";
import { FRENCH, SPANISH } from "../domain/languages";
import { AiUnavailableError } from "./errors";

// The provider SDK is the boundary: make it fail the way Gemini does under load.
const modelConfigs: unknown[] = [];
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown): { generateContent: () => Promise<never> } {
      modelConfigs.push(config);
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

  it("asks Gemini not to spend the output budget on thinking, which used to truncate the JSON", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    modelConfigs.length = 0;
    const { gradeSentence } = await import("./ai");
    await gradeSentence(FRENCH, { sentence: "Je suis content.", level: "A2", mode: "written" }).catch(() => undefined);
    expect(modelConfigs[0]).toMatchObject({ generationConfig: { maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } } });
  });
});
