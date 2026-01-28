import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 font-mono text-xs uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Industrial default - square with border
        default: "border-transparent bg-primary text-primary-foreground rounded-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground rounded-sm",
        destructive: "border-transparent bg-destructive text-destructive-foreground rounded-sm",
        // Technical outline - sharp corners
        outline: "text-foreground border-foreground/30 bg-transparent rounded-none",
        // Sector badge - bordered with accent
        sector: "border-primary/50 bg-primary/10 text-primary rounded-none",
        // Status badges
        success: "border-transparent bg-income/20 text-income rounded-sm",
        warning: "border-transparent bg-warning/20 text-warning rounded-sm",
        error: "border-transparent bg-expense/20 text-expense rounded-sm",
        // Chip styles - more rounded for interactivity
        action: "border-primary bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer rounded-sm",
        filter: "border-primary bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-sm",
        input: "border-border bg-muted text-foreground hover:bg-muted/80 cursor-pointer rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
