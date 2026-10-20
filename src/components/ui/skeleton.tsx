import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-secondary/70 dark:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };