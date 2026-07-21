"use client";

import { useEffect } from "react";
import { syncJournalData } from "@/lib/journal/syncEngine";

/** Keeps the Dexie mirror in step with Postgres: syncs on mount and whenever the browser regains connectivity. */
export function SyncBootstrap(): null {
  useEffect(() => {
    void syncJournalData();

    const handleOnline = (): void => {
      void syncJournalData();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
