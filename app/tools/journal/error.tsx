"use client";

import { ToolErrorBoundary } from "@/components/tool-error-boundary";
import { TOOL_COLORS } from "@/lib/tool-colors";

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <ToolErrorBoundary
      error={error}
      reset={reset}
      toolName="Vela Journal"
      accentColor={TOOL_COLORS.vela.accent}
    />
  );
}
