import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockRequireSpeakingAuth = vi.fn();
vi.mock("@/lib/speaking/auth", () => ({
  requireSpeakingAuth: () => mockRequireSpeakingAuth(),
}));

import { PUT as putSession } from "@/app/api/speaking/session/route";
import { PUT as putAssessment } from "@/app/api/speaking/assessment/route";
import { POST as postIdea } from "@/app/api/speaking/ideas/route";
import { PUT as putPublications } from "@/app/api/speaking/publications/route";
import { GET as getUpload } from "@/app/api/speaking/upload/route";

describe("Speaking Ledger API Auth & Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks unauthenticated writes to session, assessment, and idea bank routes", async () => {
    mockRequireSpeakingAuth.mockResolvedValue({
      supabase: null,
      unauthorized: true,
    });

    const sessionRes = await putSession(
      new NextRequest("http://localhost/api/speaking/session", {
        method: "PUT",
        body: JSON.stringify({ dayNumber: 1, premPoint: "Test" }),
      })
    );
    expect(sessionRes.status).toBe(401);

    const assessmentRes = await putAssessment(
      new NextRequest("http://localhost/api/speaking/assessment", {
        method: "PUT",
        body: JSON.stringify({
          dayNumber: 1,
          clarity: 4,
          structure: 4,
          confidence: 4,
          voice: 4,
          storytelling: 4,
          connection: 4,
          originality: 4,
        }),
      })
    );
    expect(assessmentRes.status).toBe(401);

    const ideaRes = await postIdea(
      new NextRequest("http://localhost/api/speaking/ideas", {
        method: "POST",
        body: JSON.stringify({ title: "Private spark", category: "observation" }),
      })
    );
    expect(ideaRes.status).toBe(401);
  });

  it("persists daily session and computes scorecard average on authenticated PUT", async () => {
    const upsertCalls: unknown[] = [];
    const mockSupabase = {
      from: (table: string) => ({
        upsert: (payload: unknown) => {
          upsertCalls.push({ table, payload });
          return {
            select: () => ({
              single: async () => ({ data: payload, error: null }),
            }),
          };
        },
      }),
    };

    mockRequireSpeakingAuth.mockResolvedValue({
      supabase: mockSupabase,
      unauthorized: false,
      via: "password_gate",
    });

    const sessionRes = await putSession(
      new NextRequest("http://localhost/api/speaking/session", {
        method: "PUT",
        body: JSON.stringify({
          dayNumber: 1,
          status: "completed",
          premPoint: "I build things to understand them.",
          firstRecordingUrl: "https://youtube.com/watch?v=test",
          firstRecordingMinutes: 4,
        }),
      })
    );
    expect(sessionRes.status).toBe(200);
    expect(upsertCalls[0]).toMatchObject({
      table: "speaking_sessions",
      payload: expect.objectContaining({
        day_number: 1,
        status: "completed",
        prem_point: "I build things to understand them.",
        first_recording_minutes: 4,
      }),
    });

    const assessmentRes = await putAssessment(
      new NextRequest("http://localhost/api/speaking/assessment", {
        method: "PUT",
        body: JSON.stringify({
          dayNumber: 1,
          clarity: 5,
          structure: 4,
          confidence: 4,
          voice: 4,
          storytelling: 5,
          connection: 4,
          originality: 5,
          notes: "Clearer in take two.",
        }),
      })
    );
    expect(assessmentRes.status).toBe(200);
    const json = await assessmentRes.json();
    expect(json.averageScore).toBe(4.43);
  });

  it("validates TikTok URLs and syncs valid video publications directly to site_videos", async () => {
    const insertedVideos: unknown[] = [];
    const upsertedPubs: unknown[] = [];

    const mockSupabase = {
      from: (table: string) => {
        if (table === "site_videos") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
            insert: (payload: unknown[]) => {
              insertedVideos.push(...payload);
              return {
                select: () => ({
                  single: async () => ({
                    data: { id: "11111111-1111-1111-1111-111111111111" },
                    error: null,
                  }),
                }),
              };
            },
          };
        }
        return {
          upsert: (payload: unknown[]) => {
            upsertedPubs.push(...payload);
            return {
              select: async () => ({ data: payload, error: null }),
            };
          },
        };
      },
    };

    mockRequireSpeakingAuth.mockResolvedValue({
      supabase: mockSupabase,
      unauthorized: false,
      via: "password_gate",
    });

    const badRes = await putPublications(
      new NextRequest("http://localhost/api/speaking/publications", {
        method: "PUT",
        body: JSON.stringify({
          dayNumber: 1,
          publications: [
            {
              platform: "tiktok",
              published: true,
              url: "https://www.tiktok.com/@devvvmichaell",
              videoCategory: "Speaking Challenge",
              syncToVideos: true,
            },
          ],
        }),
      })
    );
    expect(badRes.status).toBe(400);

    const goodRes = await putPublications(
      new NextRequest("http://localhost/api/speaking/publications", {
        method: "PUT",
        body: JSON.stringify({
          dayNumber: 1,
          publications: [
            {
              platform: "tiktok",
              published: true,
              url: "https://www.tiktok.com/@devvvmichaell/video/7412345678901234567",
              videoCategory: "Speaking Challenge",
              syncToVideos: true,
            },
          ],
        }),
      })
    );
    expect(goodRes.status).toBe(200);
    expect(insertedVideos).toHaveLength(1);
    expect(insertedVideos[0]).toMatchObject({
      platform: "tiktok",
      category: "Speaking Challenge",
      speaking_day_number: 1,
      is_published: true,
    });
    expect(upsertedPubs[0]).toMatchObject({
      platform: "tiktok",
      site_video_id: "11111111-1111-1111-1111-111111111111",
    });
  });

  it("rejects javascript: recording URLs on session PUT and arbitrary paths on upload GET", async () => {
    mockRequireSpeakingAuth.mockResolvedValue({
      supabase: { from: vi.fn() },
      unauthorized: false,
      via: "password_gate",
    });

    const badSessionRes = await putSession(
      new NextRequest("http://localhost/api/speaking/session", {
        method: "PUT",
        body: JSON.stringify({
          dayNumber: 1,
          firstRecordingUrl: "javascript:alert(document.cookie)",
        }),
      })
    );
    expect(badSessionRes.status).toBe(400);

    const badPathRes = await getUpload(
      new NextRequest(
        "http://localhost/api/speaking/upload?path=other-folder/secret.txt"
      )
    );
    expect(badPathRes.status).toBe(400);
  });
});
