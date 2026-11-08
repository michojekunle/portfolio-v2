"use client";

import { ToolErrorBoundary } from "@/components/tool-error-boundary";
import { TOOL_COLORS } from "@/lib/tool-colors";

export default function FlowiseError({
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
      toolName="Flowise"
      accentColor={TOOL_COLORS.flowise.accent}
    />
  );
}
