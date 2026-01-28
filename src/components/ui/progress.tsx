import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "segmented";
  segments?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", segments = 10, ...props }, ref) => {
  if (variant === "segmented") {
    const filledSegments = Math.round(((value || 0) / 100) * segments);
    
    return (
      <div 
        ref={ref}
        className={cn("flex gap-0.5 w-full", className)}
        {...props}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 transition-all duration-200",
              i < filledSegments 
                ? "bg-primary" 
                : "bg-secondary/50",
              // First segment
              i === 0 && "rounded-l-sm",
              // Last segment
              i === segments - 1 && "rounded-r-sm"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-sm bg-secondary/50",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
