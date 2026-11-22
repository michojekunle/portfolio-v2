import { beforeEach, describe, expect, it, vi } from "vitest";

const downloadVoice = vi.fn<(voiceId: string, onProgress?: (p: { loaded: number; total: number }) => void) => Promise<void>>();
vi.mock("./piper-voice", () => ({ downloadVoice: (...args: Parameters<typeof downloadVoice>) => downloadVoice(...args) }));

import { describeProgress, startVoiceDownload } from "./voice-download";

beforeEach(() => {
  downloadVoice.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("startVoiceDownload", () => {
  it("runs onReady once the download finishes", async () => {
    downloadVoice.mockResolvedValue();
    const ready = vi.fn();
    await startVoiceDownload("fr_FR-siwis-medium", ready);
    expect(ready).toHaveBeenCalledTimes(1);
  });

  it("gives a second screen asking for the same voice its own onReady, without downloading twice", async () => {
    let finish: () => void = () => undefined;
    downloadVoice.mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));
    const first = vi.fn();
    const second = vi.fn();
    const a = startVoiceDownload("es_ES-davefx-medium", first);
    const b = startVoiceDownload("es_ES-davefx-medium", second);
    // The engine is imported lazily, so the download starts a moment later.
    await vi.waitFor(() => expect(downloadVoice).toHaveBeenCalled());
    finish();
    await Promise.all([a, b]);
    expect(downloadVoice).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("doesn't call a finished download a failure when a follow-up step throws", async () => {
    downloadVoice.mockResolvedValue();
    const after = vi.fn();
    await expect(
      startVoiceDownload("fr_FR-siwis-medium", () => {
        throw new Error("speech unavailable");
      })
    ).resolves.toBeUndefined();
    await startVoiceDownload("fr_FR-siwis-medium", after);
    expect(after).toHaveBeenCalled();
  });

  it("rejects, and skips onReady, when the download fails", async () => {
    downloadVoice.mockRejectedValue(new Error("network"));
    const ready = vi.fn();
    await expect(startVoiceDownload("fr_FR-siwis-medium", ready)).rejects.toThrow("network");
    expect(ready).not.toHaveBeenCalled();
  });

  it("lets a different voice wait for the running one", async () => {
    const order: string[] = [];
    downloadVoice.mockImplementation(async (voiceId) => {
      order.push(`start:${voiceId}`);
      await Promise.resolve();
      order.push(`end:${voiceId}`);
    });
    await Promise.all([startVoiceDownload("fr_FR-siwis-medium", () => undefined), startVoiceDownload("es_ES-davefx-medium", () => undefined)]);
    expect(order).toEqual(["start:fr_FR-siwis-medium", "end:fr_FR-siwis-medium", "start:es_ES-davefx-medium", "end:es_ES-davefx-medium"]);
  });
});

describe("describeProgress", () => {
  const state = (loaded: number, total: number, bytesPerSecond: number) => ({ status: "downloading" as const, voiceId: "v", loaded, total, bytesPerSecond });

  it("shows megabytes and a time estimate", () => {
    const { percent, label } = describeProgress(state(45_000_000, 95_000_000, 500_000));
    expect(percent).toBe(47);
    expect(label).toContain("45 MB of 95 MB");
    expect(label).toContain("about 2 min left");
  });

  it("says less than a minute when nearly done", () => {
    expect(describeProgress(state(90_000_000, 95_000_000, 2_000_000)).label).toContain("less than a minute left");
  });

  it("doesn't guess before it has data, and never shows 100% until it's really done", () => {
    expect(describeProgress(state(0, 0, 0))).toEqual({ percent: 0, label: "Starting…" });
    expect(describeProgress(state(95_000_000, 95_000_000, 1)).percent).toBe(99);
  });
});
