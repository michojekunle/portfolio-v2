"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ChallengeViewMode, RustChallengeDay, RustChallengeMeta, UpdateFn } from "./types";
import { computeStreak, isDayActive } from "./types";
import { TelemetryHeader } from "./TelemetryHeader";
import { MicroTimelineRibbon } from "./MicroTimelineRibbon";
import { DailyCockpit } from "./DailyCockpit";
import { HorizonMatrix } from "./HorizonMatrix";
import { ArchitectureManifesto } from "./ArchitectureManifesto";

interface Props {
  initialDays: RustChallengeDay[];
  initialMeta?: RustChallengeMeta;
}

export function RustChallengeDashboard({ initialDays, initialMeta }: Props): React.ReactElement {
  const [days, setDays] = useState<RustChallengeDay[]>(initialDays);
  const [viewMode, setViewMode] = useState<ChallengeViewMode>("cockpit");

  // Default focus day: first unfinished day or day 1
  const firstUnfinishedDay = useMemo(() => days.find((d) => !d.completed)?.day_number ?? 1, [days]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(firstUnfinishedDay);

  useEffect(() => {
    setSelectedDayNumber((curr) => {
      if (curr && days.some((d) => d.day_number === curr)) return curr;
      return firstUnfinishedDay;
    });
  }, [firstUnfinishedDay, days]);

  const handleUpdate: UpdateFn = async (dayNumber, changes) => {
    const prev = days;
    setDays((cur) =>
      cur.map((d) =>
        d.day_number === dayNumber
          ? {
              ...d,
              ...changes,
              completed_at:
                changes.completed !== undefined
                  ? changes.completed
                    ? new Date().toISOString()
                    : null
                  : d.completed_at || new Date().toISOString(),
            }
          : d
      )
    );

    try {
      const res = await fetch("/api/admin/rust-challenge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_number: dayNumber, ...changes }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      if (data?.day) {
        setDays((cur) => cur.map((d) => (d.day_number === dayNumber ? { ...d, ...data.day } : d)));
      }
    } catch (err) {
      console.error("[rust-challenge] update error:", err);
      setDays(prev);
      toast.error("Failed to save changes — please try again");
    }
  };

  const streak = useMemo(() => computeStreak(days), [days]);
  const completedCount = useMemo(() => days.filter((d) => d.completed).length, [days]);
  const activeCount = useMemo(() => days.filter(isDayActive).length, [days]);
  const progressPct = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;

  const currentFocusDay = useMemo(
    () => days.find((d) => d.day_number === selectedDayNumber) ?? days[0],
    [days, selectedDayNumber]
  );

  const focusIndex = days.findIndex((d) => d.day_number === currentFocusDay?.day_number);

  if (days.length === 0) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <p className="font-display text-lg font-semibold text-foreground mb-1">No challenge days found</p>
        <p className="text-xs font-mono text-muted-foreground">Run the migrations in Supabase SQL Editor and refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. AWS Telemetry & Mission Control Ingress */}
      <TelemetryHeader
        days={days}
        currentDay={currentFocusDay}
        streak={streak}
        completedCount={completedCount}
        activeCount={activeCount}
        progressPct={progressPct}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 2. Micro Timeline Ribbon (Always visible across all modes for linear perspective) */}
      <MicroTimelineRibbon
        days={days}
        selectedDayNumber={selectedDayNumber}
        onSelectDay={(num) => {
          setSelectedDayNumber(num);
          setViewMode("cockpit");
        }}
      />

      {/* 3. Conditional Mode Rendering (SRP View Modules) */}
      {viewMode === "cockpit" && currentFocusDay && (
        <DailyCockpit
          day={currentFocusDay}
          totalDays={days.length}
          hasPrev={focusIndex > 0}
          hasNext={focusIndex < days.length - 1}
          onPrev={() => {
            if (focusIndex > 0) setSelectedDayNumber(days[focusIndex - 1].day_number);
          }}
          onNext={() => {
            if (focusIndex < days.length - 1) setSelectedDayNumber(days[focusIndex + 1].day_number);
          }}
          onUpdate={handleUpdate}
        />
      )}

      {viewMode === "matrix" && (
        <HorizonMatrix
          days={days}
          selectedDayNumber={selectedDayNumber}
          onSelectDay={(num) => {
            setSelectedDayNumber(num);
            setViewMode("cockpit");
          }}
          onUpdate={handleUpdate}
        />
      )}

      {viewMode === "manifesto" && initialMeta && (
        <ArchitectureManifesto initialMeta={initialMeta} />
      )}
    </div>
  );
}
