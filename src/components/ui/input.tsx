import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "technical";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground placeholder:font-mono",
          "hover:border-primary/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive",
          // Variant styles
          variant === "default" && "rounded-sm",
          variant === "technical" && "rounded-none border-primary/30 bg-background/50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

// Technical input wrapper with corner markers
const TechnicalInputWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative", className)} {...props}>
    {/* Corner markers */}
    <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-primary/50" />
    <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-primary/50" />
    <div className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-primary/50" />
    <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-primary/50" />
    {children}
  </div>
));
TechnicalInputWrapper.displayName = "TechnicalInputWrapper";

export { Input, TechnicalInputWrapper };
