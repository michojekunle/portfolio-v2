import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn("mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4", className)}
      {...props}
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 font-medium tracking-wide uppercase">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
