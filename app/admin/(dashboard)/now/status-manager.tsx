"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import type { ProfileStatusData } from "@/lib/profile-status";

interface Props {
  initialStatus: ProfileStatusData;
}

export function StatusManager({ initialStatus }: Props): React.ReactElement {
  const [form, setForm] = useState<ProfileStatusData>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof ProfileStatusData) => (val: any): void => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/profile-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          focus1_pct: Number(form.focus1_pct) || 0,
          focus2_pct: Number(form.focus2_pct) || 0,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile status");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2 dark:text-green-400">
          Profile status updated successfully!
        </div>
      )}

      <div className="space-y-4">
        {/* Availability */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Availability Status
          </label>
          <Input
            value={form.status}
            onChange={(e) => set("status")(e.target.value)}
            placeholder="Available / AFK / Deep Work"
            className="bg-muted/30"
          />
        </div>

        {/* Focuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Focus 1 Name
            </label>
            <Input
              value={form.focus1_name}
              onChange={(e) => set("focus1_name")(e.target.value)}
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Focus 1 Progress (%)
            </label>
            <Input
              type="number"
              value={form.focus1_pct}
              onChange={(e) => set("focus1_pct")(e.target.value)}
              className="bg-muted/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Focus 2 Name
            </label>
            <Input
              value={form.focus2_name}
              onChange={(e) => set("focus2_name")(e.target.value)}
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Focus 2 Progress (%)
            </label>
            <Input
              type="number"
              value={form.focus2_pct}
              onChange={(e) => set("focus2_pct")(e.target.value)}
              className="bg-muted/30"
            />
          </div>
        </div>

        {/* Next / Horizon */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Next — Horizon
          </label>
          <Input
            value={form.next_focus}
            onChange={(e) => set("next_focus")(e.target.value)}
            placeholder="e.g. zkML"
            className="bg-muted/30"
          />
        </div>

        {/* Spotify Override */}
        <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Spotify Dashboard Override
          </h3>
          <p className="text-xs text-muted-foreground">
            If you do not have Spotify live API keys configured in `.env`, the portfolio uses these values as your status.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Track Title
              </label>
              <Input
                value={form.spotify_override_title}
                onChange={(e) => set("spotify_override_title")(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Artist / Mix
              </label>
              <Input
                value={form.spotify_override_artist}
                onChange={(e) => set("spotify_override_artist")(e.target.value)}
                className="bg-muted/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Playlist Label
              </label>
              <Input
                value={form.spotify_override_playlist}
                onChange={(e) => set("spotify_override_playlist")(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Music State
              </label>
              <select
                value={form.spotify_override_active ? "true" : "false"}
                onChange={(e) => set("spotify_override_active")(e.target.value === "true")}
                className="w-full h-10 bg-muted/30 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="true">Playing (Animated)</option>
                <option value="false">Paused (Static)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Status
      </Button>
    </form>
  );
}
