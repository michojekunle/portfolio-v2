import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverEffect = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
          hoverEffect &&
            "group hover:border-border/80 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ease-out hover:-translate-y-[2px]",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
