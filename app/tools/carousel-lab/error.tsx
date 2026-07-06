"use client";

import { ToolErrorBoundary } from "@/components/tool-error-boundary";
import { TOOL_COLORS } from "@/lib/tool-colors";

export default function CarouselLabError({
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
      toolName="Carousel Lab"
      accentColor={TOOL_COLORS["carousel-lab"].accent}
    />
  );
}
