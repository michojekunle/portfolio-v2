"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import type { LanguagePack } from "../domain/language";
import { COPY, type Copy } from "./copy";

interface LangValue {
  readonly pack: LanguagePack;
  readonly copy: Copy;
}

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ pack, children }: { readonly pack: LanguagePack; readonly children: ReactNode }): ReactElement {
  return <LangContext.Provider value={{ pack, copy: COPY[pack.id] }}>{children}</LangContext.Provider>;
}

/** The active language's pack and interface copy. Every learning screen is inside a LangProvider. */
export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}
