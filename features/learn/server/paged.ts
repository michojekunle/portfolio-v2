import { PersistenceError } from "./errors";

const PAGE = 1000;

interface Page<T> {
  readonly data: T[] | null;
  readonly error: unknown;
}

/**
 * PostgREST returns at most 1000 rows per request and silently cuts the rest.
 * Reads a whole result by asking for consecutive ranges; `query` must have a
 * stable order so pages don't overlap or skip rows.
 */
export async function fetchAll<T>(operation: string, query: (from: number, to: number) => PromiseLike<Page<T>>): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) throw new PersistenceError(operation, error);
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE) return all;
  }
}
