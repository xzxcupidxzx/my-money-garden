import { cn } from "@/lib/utils";

interface TechIconProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const defaultProps = {
  size: 24,
  strokeWidth: 1.5,
};

// ============ CATEGORY ICONS ============

// Food & Dining - Plate with corner markers
export function IconFood({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Corner markers */}
      <path d="M2 2h4M2 2v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <path d="M22 2h-4M22 2v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <path d="M2 22h4M2 22v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <path d="M22 22h-4M22 22v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      {/* Plate circle */}
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth={strokeWidth} />
      {/* Inner detail */}
      <circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 2" />
    </svg>
  );
}

// Shopping - Box with target
export function IconShopping({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Chamfered box */}
      <path d="M5 8L7 4h10l2 4M5 8v10a1 1 0 001 1h12a1 1 0 001-1V8M5 8h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Handle */}
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Target crosshair */}
      <path d="M12 11v4M10 13h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.7" />
    </svg>
  );
}

// Transport - Vehicle with tech style
export function IconTransport({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Car body - chamfered */}
      <path d="M3 14l2-5h4l2-3h6l1 3h3l1 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      <path d="M3 14v3h18v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Wheels */}
      <circle cx="7" cy="17" r="2" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="17" cy="17" r="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Tech detail */}
      <path d="M10 12h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.6" />
    </svg>
  );
}

// Entertainment - Game controller HUD
export function IconEntertainment({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Controller body */}
      <path d="M6 10a4 4 0 00-4 4v1a3 3 0 006 0v-1M18 10a4 4 0 014 4v1a3 3 0 01-6 0v-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <path d="M6 10h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 012-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* D-pad */}
      <path d="M8 12v2M7 13h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Buttons */}
      <circle cx="16" cy="12" r="0.5" fill={color} />
      <circle cx="17" cy="13" r="0.5" fill={color} />
    </svg>
  );
}

// Bills & Utilities - Receipt with data lines
export function IconBills({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Receipt shape with chamfer */}
      <path d="M6 2l1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1v20l-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1V2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Data lines */}
      <path d="M8 7h8M8 11h5M8 15h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.7" />
      {/* Amount highlight */}
      <path d="M14 15h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}

// Health - Medical cross with HUD frame
export function IconHealth({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* HUD corners */}
      <path d="M3 3h3M3 3v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      <path d="M21 3h-3M21 3v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      <path d="M3 21h3M3 21v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      <path d="M21 21h-3M21 21v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      {/* Medical cross */}
      <path d="M12 6v12M6 12h12" stroke={color} strokeWidth={strokeWidth * 1.5} strokeLinecap="square" />
      {/* Center node */}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

// Education - Book with data
export function IconEducation({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Open book */}
      <path d="M12 5c-2-2-5-2-8-1v14c3-1 6-1 8 1m0-14c2-2 5-2 8-1v14c-3-1-6-1-8 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Spine */}
      <path d="M12 5v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Data lines */}
      <path d="M6 9h3M6 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <path d="M15 9h3M16 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}

// Salary/Income - Arrow up with plus
export function IconIncome({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Base frame */}
      <path d="M4 20h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Up arrow */}
      <path d="M12 17V5M8 9l4-4 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Plus indicator */}
      <path d="M19 7v4M17 9h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.6" />
    </svg>
  );
}

// Expense - Arrow down with minus
export function IconExpense({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Base frame */}
      <path d="M4 4h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Down arrow */}
      <path d="M12 7v12M8 15l4 4 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Minus indicator */}
      <path d="M17 9h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.6" />
    </svg>
  );
}

// Gift - Present box with bow
export function IconGift({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Box body */}
      <path d="M4 10h16v11H4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Lid */}
      <path d="M3 7h18v3H3z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Ribbon vertical */}
      <path d="M12 7v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Bow */}
      <path d="M12 7c-2-3-4-3-5-2s0 3 2 4M12 7c2-3 4-3 5-2s0 3-2 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
    </svg>
  );
}

// ============ ACCOUNT ICONS ============

// Cash - Bills with corner
export function IconCash({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Corner markers */}
      <path d="M2 4h3M2 4v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      <path d="M22 4h-3M22 4v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      {/* Main bill */}
      <rect x="3" y="6" width="18" height="12" rx="1" stroke={color} strokeWidth={strokeWidth} />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      {/* Value indicator */}
      <path d="M12 10v4M10.5 11.5l1.5-1.5 1.5 1.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.6" />
    </svg>
  );
}

// Bank - Building with columns
export function IconBank({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Roof */}
      <path d="M3 9l9-6 9 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Top bar */}
      <path d="M4 9h16v2H4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Columns */}
      <path d="M6 11v7M10 11v7M14 11v7M18 11v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Base */}
      <path d="M3 18h18v2H3z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
    </svg>
  );
}

// Credit Card - Tech style card
export function IconCard({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Card body with chamfer */}
      <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Stripe */}
      <path d="M3 9h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Chip */}
      <rect x="5" y="12" width="4" height="3" stroke={color} strokeWidth={strokeWidth} opacity="0.7" />
      {/* Numbers indicator */}
      <path d="M13 15h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}

// E-Wallet - Digital wallet
export function IconEWallet({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Phone body */}
      <rect x="6" y="3" width="12" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Screen */}
      <rect x="8" y="6" width="8" height="10" stroke={color} strokeWidth={strokeWidth} opacity="0.5" />
      {/* Signal waves */}
      <path d="M10 9a2 2 0 012-2M9 10.5a3.5 3.5 0 013.5-3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.6" />
      {/* Home button */}
      <circle cx="12" cy="18.5" r="1" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

// Savings - Piggy bank tech style
export function IconSavings({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Body */}
      <ellipse cx="12" cy="13" rx="7" ry="5" stroke={color} strokeWidth={strokeWidth} />
      {/* Ears */}
      <path d="M7 9c-1-1-2-2-1-3s2 0 3 1M17 9c1-1 2-2 1-3s-2 0-3 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Coin slot */}
      <path d="M10 8h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Legs */}
      <path d="M8 17v2M16 17v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Tail */}
      <path d="M19 12c1 0 2 1 2 0s-1-1-2-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Eye */}
      <circle cx="9" cy="12" r="0.5" fill={color} />
    </svg>
  );
}

// Investment - Chart with trend
export function IconInvestment({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Frame corners */}
      <path d="M3 3h3M3 3v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      <path d="M21 21h-3M21 21v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      {/* Axis */}
      <path d="M4 4v16h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Trend line */}
      <path d="M6 16l4-4 4 2 6-8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Data points */}
      <circle cx="6" cy="16" r="1.5" fill={color} opacity="0.6" />
      <circle cx="10" cy="12" r="1.5" fill={color} opacity="0.6" />
      <circle cx="14" cy="14" r="1.5" fill={color} opacity="0.6" />
      <circle cx="20" cy="6" r="1.5" fill={color} />
    </svg>
  );
}

// ============ UI ICONS ============

// Dashboard - Grid with data
export function IconDashboard({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Grid boxes */}
      <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Data indicators */}
      <path d="M5 7h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <path d="M16 5v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <circle cx="6.5" cy="17.5" r="1.5" stroke={color} strokeWidth={strokeWidth} opacity="0.5" />
      <path d="M16 16l3 3M16 19l3-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}

// Settings - Gear with corners
export function IconSettings({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Outer gear shape */}
      <path d="M12 2l1 2.5 2.5-.5 0 2.5 2.5 1-1.5 2 1.5 2-2.5 1 0 2.5-2.5-.5-1 2.5-1-2.5-2.5.5 0-2.5-2.5-1 1.5-2-1.5-2 2.5-1 0-2.5 2.5.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1" fill={color} opacity="0.5" />
    </svg>
  );
}

// Statistics - Bar chart
export function IconStatistics({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Corner markers */}
      <path d="M2 2h3M2 2v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      <path d="M22 22h-3M22 22v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.4" />
      {/* Bars */}
      <rect x="4" y="14" width="4" height="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <rect x="10" y="8" width="4" height="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <rect x="16" y="4" width="4" height="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Value indicators */}
      <path d="M6 12v-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      <path d="M12 6v-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}

// History - Clock with tech style
export function IconHistory({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Clock circle */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      {/* Hour markers */}
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
      {/* Hands */}
      <path d="M12 12V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <path d="M12 12l4 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Center */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* Rewind arrow */}
      <path d="M3 4v4h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
    </svg>
  );
}

// Transfer - Double arrows
export function IconTransfer({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Arrow right */}
      <path d="M4 8h14M14 4l4 4-4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Arrow left */}
      <path d="M20 16H6M10 12l-4 4 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Connection nodes */}
      <circle cx="4" cy="8" r="1" fill={color} opacity="0.5" />
      <circle cx="20" cy="16" r="1" fill={color} opacity="0.5" />
    </svg>
  );
}

// Add/Plus - Crosshair style
export function IconAdd({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} opacity="0.4" />
      {/* Plus */}
      <path d="M12 7v10M7 12h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Corner details */}
      <path d="M5 5l2 2M19 5l-2 2M5 19l2-2M19 19l-2-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.3" />
    </svg>
  );
}

// Budget - Target with bars
export function IconBudget({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Target circles */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={strokeWidth} strokeDasharray="3 2" opacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* Crosshairs */}
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}

// AI/Magic - Circuit brain
export function IconAI({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Head outline */}
      <path d="M12 3a7 7 0 017 7v3a4 4 0 01-4 4h-6a4 4 0 01-4-4v-3a7 7 0 017-7z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Circuit lines */}
      <path d="M9 8v2h2v2h2v-2h2V8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" opacity="0.6" />
      {/* Eyes */}
      <circle cx="9" cy="11" r="1" fill={color} />
      <circle cx="15" cy="11" r="1" fill={color} />
      {/* Antenna */}
      <path d="M12 3v-1M10 2h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Neck */}
      <path d="M10 17v3h4v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}

// Recurring - Loop with clock
export function IconRecurring({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Circular arrows */}
      <path d="M21 12a9 9 0 11-3-6.7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <path d="M21 5v4h-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Clock hands */}
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} opacity="0.5" />
      <path d="M12 10v2l1 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}

// Home
export function IconHome({ className, size = defaultProps.size, color = "currentColor", strokeWidth = defaultProps.strokeWidth }: TechIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Roof */}
      <path d="M3 10l9-7 9 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* House body */}
      <path d="M5 10v10h14V10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="bevel" />
      {/* Door */}
      <path d="M10 20v-6h4v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      {/* Window */}
      <rect x="14" y="12" width="3" height="3" stroke={color} strokeWidth={strokeWidth} opacity="0.6" />
    </svg>
  );
}

// Export all icons as a map for dynamic usage
export const TECH_ICONS = {
  // Categories
  IconFood,
  IconShopping,
  IconTransport,
  IconEntertainment,
  IconBills,
  IconHealth,
  IconEducation,
  IconIncome,
  IconExpense,
  IconGift,
  // Accounts
  IconCash,
  IconBank,
  IconCard,
  IconEWallet,
  IconSavings,
  IconInvestment,
  // UI
  IconDashboard,
  IconSettings,
  IconStatistics,
  IconHistory,
  IconTransfer,
  IconAdd,
  IconBudget,
  IconAI,
  IconRecurring,
  IconHome,
} as const;

export type TechIconName = keyof typeof TECH_ICONS;
