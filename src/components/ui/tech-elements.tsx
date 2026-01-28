import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// Technical label - SECTOR_07 style
interface TechLabelProps {
  children: ReactNode;
  variant?: "default" | "bordered" | "badge";
  className?: string;
}

export function TechLabel({ children, variant = "default", className }: TechLabelProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs uppercase tracking-widest text-muted-foreground",
        variant === "bordered" && "px-2 py-0.5 border border-current",
        variant === "badge" && "px-2 py-0.5 bg-muted rounded-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

// Large display number - architectural style
interface DisplayNumberProps {
  value: string | number;
  label?: string;
  className?: string;
}

export function DisplayNumber({ value, label, className }: DisplayNumberProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <TechLabel className="mb-1">{label}</TechLabel>}
      <span className="font-sans text-4xl font-bold tracking-tighter leading-none tabular-nums">
        {value}
      </span>
    </div>
  );
}

// Technical divider with connection nodes
interface TechDividerProps {
  className?: string;
}

export function TechDivider({ className }: TechDividerProps) {
  return (
    <div className={cn("divider-technical", className)} />
  );
}

// Corner markers for cards
interface CornerMarkersProps {
  children: ReactNode;
  variant?: "brackets" | "nodes" | "hud";
  className?: string;
}

export function CornerMarkers({ children, variant = "brackets", className }: CornerMarkersProps) {
  const variantClass = {
    brackets: "card-technical",
    nodes: "card-nodes",
    hud: "card-hud"
  }[variant];

  return (
    <div className={cn(variantClass, className)}>
      {children}
    </div>
  );
}

// Diagonal stripe accent
interface StripeAccentProps {
  className?: string;
  direction?: "left" | "right";
}

export function StripeAccent({ className, direction = "right" }: StripeAccentProps) {
  return (
    <div
      className={cn(
        "h-2 w-full",
        className
      )}
      style={{
        backgroundImage: `repeating-linear-gradient(
          ${direction === "right" ? "-45deg" : "45deg"},
          hsl(var(--primary)),
          hsl(var(--primary)) 3px,
          transparent 3px,
          transparent 8px
        )`
      }}
    />
  );
}

// Crosshair marker
interface CrosshairProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Crosshair({ className, size = "md" }: CrosshairProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }[size];

  return (
    <div className={cn("relative", sizeClass, className)}>
      <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/30" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary/60" />
    </div>
  );
}

// Sector badge - inspired by GENERATE_CODE style
interface SectorBadgeProps {
  code: string;
  label?: string;
  className?: string;
}

export function SectorBadge({ code, label, className }: SectorBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-mono text-lg font-bold tracking-tight">{code}</span>
      {label && (
        <span className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 border border-foreground/30">
          {label}
        </span>
      )}
    </div>
  );
}

// Data row - technical data display
interface DataRowProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function DataRow({ label, value, unit, className }: DataRowProps) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-mono tabular-nums">
        {value}
        {unit && <span className="text-muted-foreground ml-1 text-sm">{unit}</span>}
      </span>
    </div>
  );
}

// Technical frame - circuit-like border
interface TechFrameProps {
  children: ReactNode;
  className?: string;
}

export function TechFrame({ children, className }: TechFrameProps) {
  return (
    <div className={cn("relative p-4", className)}>
      {/* Top left corner */}
      <div className="absolute top-0 left-0 w-6 h-6">
        <div className="absolute top-0 left-0 w-4 h-px bg-border" />
        <div className="absolute top-0 left-0 w-px h-4 bg-border" />
        <div className="absolute top-0 left-4 w-2 h-px bg-primary/50" />
        <div className="absolute top-4 left-0 w-px h-2 bg-primary/50" />
      </div>
      
      {/* Top right corner */}
      <div className="absolute top-0 right-0 w-6 h-6">
        <div className="absolute top-0 right-0 w-4 h-px bg-border" />
        <div className="absolute top-0 right-0 w-px h-4 bg-border" />
        <div className="absolute top-0 right-4 w-2 h-px bg-primary/50" />
        <div className="absolute top-4 right-0 w-px h-2 bg-primary/50" />
      </div>
      
      {/* Bottom left corner */}
      <div className="absolute bottom-0 left-0 w-6 h-6">
        <div className="absolute bottom-0 left-0 w-4 h-px bg-border" />
        <div className="absolute bottom-0 left-0 w-px h-4 bg-border" />
        <div className="absolute bottom-0 left-4 w-2 h-px bg-primary/50" />
        <div className="absolute bottom-4 left-0 w-px h-2 bg-primary/50" />
      </div>
      
      {/* Bottom right corner */}
      <div className="absolute bottom-0 right-0 w-6 h-6">
        <div className="absolute bottom-0 right-0 w-4 h-px bg-border" />
        <div className="absolute bottom-0 right-0 w-px h-4 bg-border" />
        <div className="absolute bottom-0 right-4 w-2 h-px bg-primary/50" />
        <div className="absolute bottom-4 right-0 w-px h-2 bg-primary/50" />
      </div>
      
      {children}
    </div>
  );
}
