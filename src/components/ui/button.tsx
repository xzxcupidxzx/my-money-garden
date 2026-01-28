import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-sm font-medium uppercase tracking-wider ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary Action - Industrial solid
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/80 active:scale-[0.98] rounded-sm",
        // Destructive/Error
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:bg-destructive/80 rounded-sm",
        // Secondary Action - outline with sharp corners
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50 active:bg-accent/80 rounded-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 rounded-sm",
        // Ghost - subtle
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 rounded-sm",
        // Text Link
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        // NEW: Technical - bordered with corner accents
        technical: "relative border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary active:bg-primary/20 rounded-none before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t before:border-l before:border-primary after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b after:border-r after:border-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
