import { describe, expect, it } from "vitest";
import { PersistenceError } from "./errors";
import { fetchAll } from "./paged";

const source = (total: number) => (from: number, to: number) => Promise.resolve({ data: Array.from({ length: Math.max(0, Math.min(to + 1, total) - from) }, (_, i) => from + i), error: null });

describe("fetchAll", () => {
  it("reads past the 1000-row cap", async () => {
    const rows = await fetchAll("test", source(2500));
    expect(rows).toHaveLength(2500);
    expect(new Set(rows).size).toBe(2500);
  });

  it("handles an exact multiple of the page size", async () => {
    expect(await fetchAll("test", source(2000))).toHaveLength(2000);
  });

  it("handles no rows", async () => {
    expect(await fetchAll("test", source(0))).toEqual([]);
  });

  it("surfaces a database error with context", async () => {
    await expect(fetchAll("listThings", () => Promise.resolve({ data: null, error: { message: "boom" } }))).rejects.toBeInstanceOf(PersistenceError);
  });
});
