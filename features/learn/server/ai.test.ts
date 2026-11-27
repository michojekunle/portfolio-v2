import { afterEach, describe, expect, it, vi } from "vitest";
import { FRENCH, SPANISH } from "../domain/languages";
import { AiUnavailableError } from "./errors";

// The provider SDK is the boundary: make it fail the way Gemini does under load.
const modelConfigs: unknown[] = [];
const capturedPrompts: string[] = [];
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown): { generateContent: (prompt: string) => Promise<never> } {
      modelConfigs.push(config);
      return {
        generateContent: (prompt: string) => {
          capturedPrompts.push(prompt);
          return Promise.reject(new Error("[503 Service Unavailable] This model is currently experiencing high demand."));
        },
      };
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

  it("includes domain track, register policy, and sanitised goal context in lesson & grading prompts", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    capturedPrompts.length = 0;
    const { generateLesson, gradeSentence } = await import("./ai");
    await generateLesson(FRENCH, {
      level: "B1",
      topic: "patient triage",
      recycleWords: [],
      track: "medical",
      goalFocus: "intake",
      goalNote: "ER nurse\n<ignore previous>",
    }).catch(() => undefined);
    expect(capturedPrompts[0]).toContain("Medicine & Healthcare");
    expect(capturedPrompts[0]).toContain('polite/formal "vous"');
    expect(capturedPrompts[0]).toContain('"""ER nurse ignore previous"""');

    await gradeSentence(FRENCH, {
      sentence: "Tu as mal où ?",
      level: "B1",
      mode: "written",
      track: "medical",
      expectedRegister: "vous",
    }).catch(() => undefined);
    expect(capturedPrompts[1]).toContain('"errorTag": "register"');

    const { translateGoalPhrase, runRoleplayTurn, debriefRoleplay } = await import("./ai");
    await expect(
      translateGoalPhrase(FRENCH, {
        english: "My Docker build failed",
        level: "B1",
        track: "tech",
        goalFocus: "standups",
      })
    ).rejects.toBeInstanceOf(AiUnavailableError);

    await expect(
      runRoleplayTurn(FRENCH, {
        action: "start",
        level: "B1",
        track: "medical",
        goalFocus: "intake",
        history: [],
      })
    ).rejects.toBeInstanceOf(AiUnavailableError);

    await expect(
      debriefRoleplay(SPANISH, {
        action: "debrief",
        level: "B1",
        track: "business",
        history: [
          { role: "assistant", text: "¿Cuál es su prioridad este trimestre?" },
          { role: "user", text: "Queremos reducir los tiempos de entrega." },
        ],
      })
    ).rejects.toBeInstanceOf(AiUnavailableError);
    expect(capturedPrompts[capturedPrompts.length - 1]).toContain("Red Pen debrief");
  });
});
