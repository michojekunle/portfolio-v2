"use client";

import { useEffect } from "react";

interface Props {
  toolId: string;
}

export function PwaRegistrar({ toolId }: Props): null {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", { scope: `/tools/${toolId}/` })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              // New SW available — could show a "refresh" toast here
              console.info(`[pwa] ${toolId} update available`);
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[pwa] SW registration failed:", err);
      });
  }, [toolId]);

  return null;
}
