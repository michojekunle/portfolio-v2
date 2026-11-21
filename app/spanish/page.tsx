import type { ReactElement } from "react";
import { spanishFontVariables } from "@/features/learn/ui/fonts";
import { LearnApp } from "@/features/learn/ui/LearnApp";

export default function SpanishPage(): ReactElement {
  return <LearnApp fontClassName={spanishFontVariables} lang="es" />;
}
