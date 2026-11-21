import type { ReactElement } from "react";
import { frenchFontVariables } from "@/features/learn/ui/fonts";
import { LearnApp } from "@/features/learn/ui/LearnApp";

export default function FrenchPage(): ReactElement {
  return <LearnApp fontClassName={frenchFontVariables} lang="fr" />;
}
