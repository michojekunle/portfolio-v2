import { describe, expect, it } from "vitest";
import { MAX_GROUP_SIZE, daysSinceLast, generateInviteCode, groupStreak, normaliseInviteCode, todayStatus, type MemberActivity } from "./groups";

const member = (userId: string, completedOn: string[], joinedOn = "2026-11-01"): MemberActivity => ({ userId, displayName: userId, joinedOn, completedOn });

describe("invite codes", () => {
  it("are 8 characters from an unambiguous alphabet", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(code).not.toMatch(/[01IOL]/);
  });

  it("normalise what people paste or type", () => {
    expect(normaliseInviteCode(" abcd-efgh ")).toBe("ABCDEFGH");
  });

  it("caps groups at five", () => {
    expect(MAX_GROUP_SIZE).toBe(5);
  });
});

describe("groupStreak", () => {
  const today = "2026-11-21";

  it("counts days in a row where everyone finished", () => {
    const members = [member("a", ["2026-11-19", "2026-11-20", "2026-11-21"]), member("b", ["2026-11-19", "2026-11-20", "2026-11-21"])];
    expect(groupStreak(members, today)).toBe(3);
  });

  it("stays alive from yesterday while someone still has today to finish", () => {
    const members = [member("a", ["2026-11-20", "2026-11-21"]), member("b", ["2026-11-20"])];
    expect(groupStreak(members, today)).toBe(1);
  });

  it("breaks when a whole day passed with someone missing", () => {
    const members = [member("a", ["2026-11-19", "2026-11-20"]), member("b", ["2026-11-19"])];
    expect(groupStreak(members, today)).toBe(0);
  });

  it("only counts a member from the day they joined", () => {
    const members = [member("a", ["2026-11-19", "2026-11-20", "2026-11-21"]), member("new", ["2026-11-21"], "2026-11-21")];
    expect(groupStreak(members, today)).toBe(3);
  });

  it("doesn't break the streak on the day someone joins without finishing", () => {
    // joinedOn comes from a UTC timestamp, so it can be a day before the member's local join day.
    const members = [member("a", ["2026-11-19", "2026-11-20", "2026-11-21"]), member("new", [], "2026-11-20")];
    // Today is still open for "new"; their join day (11-20) is excused, so the streak holds at 2.
    expect(groupStreak(members, today)).toBe(2);
  });

  it("counts streaks longer than two months", () => {
    const days = Array.from({ length: 90 }, (_, i) => new Date(Date.UTC(2026, 10, 21 - i)).toISOString().slice(0, 10));
    const members = [member("a", days, "2026-01-01"), member("b", days, "2026-01-01")];
    expect(groupStreak(members, today)).toBe(90);
  });

  it("is zero for an empty group", () => {
    expect(groupStreak([], today)).toBe(0);
  });
});

describe("today's status", () => {
  it("counts who has finished today", () => {
    const status = todayStatus([member("a", ["2026-11-21"]), member("b", ["2026-11-20"])], "2026-11-21");
    expect(status.done).toBe(1);
    expect(status.total).toBe(2);
    expect(status.doneIds.has("a")).toBe(true);
  });

  it("reports days since a member's last page", () => {
    expect(daysSinceLast(member("a", ["2026-11-18", "2026-11-20"]), "2026-11-21")).toBe(1);
    expect(daysSinceLast(member("b", []), "2026-11-21")).toBeNull();
  });
});
