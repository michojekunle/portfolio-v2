"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency } from "@/lib/flowise/calculator";

const PrivacyContext = createContext({ hidden: false, toggle: () => {} });

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("fw_hide") === "true") setHidden(true);
  }, []);

  const toggle = () => {
    setHidden(prev => {
      const next = !prev;
      localStorage.setItem("fw_hide", String(next));
      return next;
    });
  };

  return (
    <PrivacyContext.Provider value={{ hidden: mounted ? hidden : false, toggle }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export function Amount({ value, currency = "NGN", abs = false }: { value: number; currency?: string; abs?: boolean }) {
  const { hidden } = usePrivacy();
  if (hidden) return <span className="font-mono opacity-60 tracking-widest">****</span>;
  return <>{formatCurrency(value, currency, abs)}</>;
}
