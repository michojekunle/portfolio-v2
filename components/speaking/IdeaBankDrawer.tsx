"use client";

import { useId, useState } from "react";
import { Lightbulb, Plus, Loader2, Trash2, CheckCircle2, Tag } from "lucide-react";
import { toast } from "sonner";
import { IDEA_CATEGORIES } from "@/lib/speaking/methodology";
import type { IdeaBankItem, IdeaCategory, IdeaStatus } from "@/lib/speaking/types";
import { cn } from "@/lib/utils";

interface QuickIdeaCaptureProps {
  defaultDayNumber?: number | null;
  onCreated?: (idea: IdeaBankItem) => void;
  compact?: boolean;
}

export function QuickIdeaCapture({
  defaultDayNumber = null,
  onCreated,
  compact = false,
}: QuickIdeaCaptureProps): React.ReactElement {
  const uid = useId();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("observation");
  const [body, setBody] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [linkedDayNumber, setLinkedDayNumber] = useState<string>(
    defaultDayNumber ? String(defaultDayNumber) : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give the idea a short title first.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedDay = linkedDayNumber ? Number(linkedDayNumber) : null;
      const res = await fetch("/api/speaking/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          body: body.trim(),
          sourceRef: sourceRef.trim(),
          linkedDayNumber:
            parsedDay && parsedDay >= 1 && parsedDay <= 90 ? parsedDay : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save idea");

      const row = data.idea as Record<string, unknown>;
      const created: IdeaBankItem = {
        id: String(row.id),
        title: String(row.title),
        category: row.category as IdeaCategory,
        body: String(row.body ?? ""),
        sourceRef: String(row.source_ref ?? ""),
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        linkedDayNumber: row.linked_day_number != null ? Number(row.linked_day_number) : null,
        status: (row.status as IdeaStatus) || "raw",
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
      };

      setTitle("");
      setBody("");
      setSourceRef("");
      toast.success("Saved to Idea Bank");
      onCreated?.(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save idea");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-5 space-y-3.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-(--ink-2)" strokeWidth={1.6} aria-hidden="true" />
          <h3 className="font-display text-lg font-normal text-(--ink) m-0">
            The Idea Bank
          </h3>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
          Raw Material
        </span>
      </div>

      {!compact && (
        <p className="text-sm text-(--ink-2) leading-relaxed m-0">
          Capture an observation, question, reading note, disagreement, or conversation before it disappears.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <input
          id={`${uid}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Idea headline"
          placeholder="Idea headline or spark..."
          className="sm:col-span-2 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 text-base sm:text-sm text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none"
        />
        <select
          id={`${uid}-category`}
          value={category}
          onChange={(e) => setCategory(e.target.value as IdeaCategory)}
          aria-label="Idea category"
          className="rounded-[4px] border border-(--rule) bg-(--bg) px-2.5 py-2 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
        >
          {IDEA_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        id={`${uid}-body`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="Idea details"
        rows={compact ? 2 : 3}
        placeholder="Why did this catch your attention? What point or story could it become?"
        className="w-full rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 text-base sm:text-sm text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none resize-y"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
        <input
          id={`${uid}-source`}
          type="text"
          value={sourceRef}
          onChange={(e) => setSourceRef(e.target.value)}
          aria-label="Source or reference link"
          placeholder="Source / book / link (optional)"
          className="sm:col-span-2 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 text-base sm:text-xs text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <input
            id={`${uid}-day`}
            type="number"
            min={1}
            max={90}
            value={linkedDayNumber}
            onChange={(e) => setLinkedDayNumber(e.target.value)}
            placeholder="Day #"
            aria-label="Link to day number"
            className="w-20 rounded-[4px] border border-(--rule) bg-(--bg) px-2.5 py-2 font-mono text-base sm:text-xs tabular-nums text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-3 py-2 min-h-[38px] text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Save Idea
          </button>
        </div>
      </div>
    </form>
  );
}

interface IdeaBankListProps {
  ideas: IdeaBankItem[];
  onIdeasChange: (ideas: IdeaBankItem[]) => void;
}

export function IdeaBankManager({ ideas, onIdeasChange }: IdeaBankListProps): React.ReactElement {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = ideas.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.sourceRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateStatus = async (id: string, status: IdeaStatus): Promise<void> => {
    setBusyId(id);
    try {
      const res = await fetch("/api/speaking/ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      onIdeasChange(ideas.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Could not update idea");
    } finally {
      setBusyId(null);
    }
  };

  const deleteIdea = async (id: string): Promise<void> => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/speaking/ideas?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onIdeasChange(ideas.filter((i) => i.id !== id));
      setConfirmDeleteId(null);
      toast.success("Idea removed");
    } catch {
      toast.error("Could not delete idea");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <QuickIdeaCapture
        onCreated={(created) => onIdeasChange([created, ...ideas])}
      />

      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search ideas"
          placeholder="Search ideas..."
          className="flex-1 min-w-[180px] rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 text-base sm:text-sm text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter by category"
          className="rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-2 text-base sm:text-xs text-(--ink)"
        >
          <option value="all">All categories</option>
          {IDEA_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
          className="rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-2 text-base sm:text-xs text-(--ink)"
        >
          <option value="all">All statuses</option>
          <option value="raw">Raw</option>
          <option value="developing">Developing</option>
          <option value="used">Used</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-(--rule) p-8 text-center">
          <p className="font-display text-lg text-(--ink) m-0">No ideas captured here yet.</p>
          <p className="text-sm text-(--ink-2) mt-1 mb-0">
            Save observations, disagreements, reading sparks, or technical analogies as they surface during your day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const catLabel =
              IDEA_CATEGORIES.find((c) => c.id === item.category)?.label ?? item.category;
            return (
              <article
                key={item.id}
                className="rounded-[6px] border border-(--rule) bg-(--paper) p-5 flex flex-col justify-between gap-4 min-w-0"
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-[2px] border border-(--rule) bg-(--bg-2) px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {catLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.linkedDayNumber && (
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) tabular-nums">
                          Day {item.linkedDayNumber}
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]",
                          item.status === "used"
                            ? "bg-(--good)/15 text-(--good)"
                            : item.status === "developing"
                            ? "bg-(--ink)/10 text-(--ink)"
                            : "bg-(--bg-2) text-(--ink-2)"
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-display text-lg font-normal text-(--ink) leading-snug m-0 break-words">
                    {item.title}
                  </h4>
                  {item.body && (
                    <p className="text-sm text-(--ink-2) leading-relaxed m-0 whitespace-pre-wrap break-words">
                      {item.body}
                    </p>
                  )}
                  {item.sourceRef && (
                    <p className="font-mono text-[11px] text-(--ink-2) truncate m-0">
                      Source: {item.sourceRef}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-(--rule-2)">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(["raw", "developing", "used"] as IdeaStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={busyId === item.id}
                        aria-pressed={item.status === st}
                        onClick={() => void updateStatus(item.id, st)}
                        className={cn(
                          "rounded-[4px] border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors",
                          item.status === st
                            ? "border-(--ink) bg-(--ink) text-(--bg)"
                            : "border-(--rule) text-(--ink-2) hover:text-(--ink)"
                        )}
                      >
                        {st === "used" && <CheckCircle2 className="inline h-3 w-3 mr-1" aria-hidden="true" />}
                        {st}
                      </button>
                    ))}
                  </div>
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => void deleteIdea(item.id)}
                        className="rounded-[4px] border border-destructive bg-destructive text-white px-2.5 py-1 font-mono text-[11px] cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-[4px] border border-(--rule) px-2 py-1 font-mono text-[11px] text-(--ink-2) cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => setConfirmDeleteId(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="p-2 rounded-[4px] text-(--ink-2) hover:text-destructive transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
