import React from 'react';

interface AppLogoProps {
  size?: number;
  variant?: 'chart' | 'currency' | 'grid';
  className?: string;
}

/**
 * App Logo Component - Industrial-Tech/Blueprint Style
 * Features: Corner markers, monoline strokes, chamfered edges
 */
export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 512, 
  variant = 'chart',
  className = '' 
}) => {
  const strokeWidth = size * 0.004; // Proportional stroke
  const cornerSize = size * 0.08; // Corner marker size
  const cornerThickness = size * 0.012; // Corner marker thickness
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background with gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      
      {/* Main background */}
      <rect width="512" height="512" fill="url(#bgGradient)" />
      
      {/* Corner Markers - HUD Style */}
      <CornerMarkers size={cornerSize} thickness={cornerThickness} />
      
      {/* Main Icon Content */}
      {variant === 'chart' && <ChartGrowthIcon />}
      {variant === 'currency' && <CurrencyCircleIcon />}
      {variant === 'grid' && <DashboardGridIcon />}
      
      {/* Subtle grid pattern overlay */}
      <GridPattern />
    </svg>
  );
};

// Corner Markers Component
const CornerMarkers: React.FC<{ size: number; thickness: number }> = ({ size, thickness }) => (
  <g stroke="rgba(255,255,255,0.4)" strokeWidth={thickness} fill="none">
    {/* Top-left corner */}
    <path d={`M ${size} 24 L 24 24 L 24 ${size}`} />
    {/* Top-right corner */}
    <path d={`M ${512 - size} 24 L ${512 - 24} 24 L ${512 - 24} ${size}`} />
    {/* Bottom-left corner */}
    <path d={`M ${size} ${512 - 24} L 24 ${512 - 24} L 24 ${512 - size}`} />
    {/* Bottom-right corner */}
    <path d={`M ${512 - size} ${512 - 24} L ${512 - 24} ${512 - 24} L ${512 - 24} ${512 - size}`} />
  </g>
);

// Chart Growth Icon - Option A
const ChartGrowthIcon: React.FC = () => {
  const barWidth = 48;
  const gap = 20;
  const baseY = 360;
  const startX = 140;
  
  // Bar heights representing growth
  const bars = [
    { height: 80 },
    { height: 140 },
    { height: 200 },
    { height: 260 },
  ];
  
  return (
    <g>
      {/* Inner frame */}
      <rect
        x="100"
        y="100"
        width="312"
        height="312"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
      />
      
      {/* Growth bars with gradient */}
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={startX + i * (barWidth + gap)}
          y={baseY - bar.height}
          width={barWidth}
          height={bar.height}
          fill="url(#accentGradient)"
          rx="4"
        />
      ))}
      
      {/* Trend line */}
      <path
        d="M 164 320 Q 230 260, 280 220 T 348 140"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Arrow head for trend */}
      <polygon
        points="340,130 360,145 345,155"
        fill="white"
      />
      
      {/* Currency symbol */}
      <text
        x="256"
        y="440"
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="32"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        FINANCE
      </text>
    </g>
  );
};

// Currency Circle Icon - Option B
const CurrencyCircleIcon: React.FC = () => (
  <g>
    {/* Outer technical circle */}
    <circle
      cx="256"
      cy="256"
      r="160"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="2"
      strokeDasharray="8 4"
    />
    
    {/* Inner solid circle */}
    <circle
      cx="256"
      cy="256"
      r="120"
      fill="rgba(255,255,255,0.1)"
      stroke="white"
      strokeWidth="3"
    />
    
    {/* Dollar sign */}
    <text
      x="256"
      y="290"
      textAnchor="middle"
      fill="white"
      fontSize="140"
      fontFamily="JetBrains Mono, monospace"
      fontWeight="bold"
    >
      $
    </text>
    
    {/* Accent lines */}
    <line x1="180" y1="120" x2="220" y2="120" stroke="#22c55e" strokeWidth="4" />
    <line x1="292" y1="120" x2="332" y2="120" stroke="#22c55e" strokeWidth="4" />
    <line x1="180" y1="392" x2="220" y2="392" stroke="#22c55e" strokeWidth="4" />
    <line x1="292" y1="392" x2="332" y2="392" stroke="#22c55e" strokeWidth="4" />
    
    {/* Label */}
    <text
      x="256"
      y="440"
      textAnchor="middle"
      fill="rgba(255,255,255,0.6)"
      fontSize="28"
      fontFamily="JetBrains Mono, monospace"
    >
      TRACKER
    </text>
  </g>
);

// Dashboard Grid Icon - Option C
const DashboardGridIcon: React.FC = () => {
  const gridSize = 100;
  const gap = 24;
  const startX = 140;
  const startY = 140;
  
  const cells = [
    { x: 0, y: 0, accent: true },
    { x: 1, y: 0, accent: false },
    { x: 0, y: 1, accent: false },
    { x: 1, y: 1, accent: true },
  ];
  
  return (
    <g>
      {/* Grid cells */}
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={startX + cell.x * (gridSize + gap)}
          y={startY + cell.y * (gridSize + gap)}
          width={gridSize}
          height={gridSize}
          fill={cell.accent ? "url(#accentGradient)" : "rgba(255,255,255,0.15)"}
          stroke="white"
          strokeWidth="2"
          rx="8"
        />
      ))}
      
      {/* Small chart in top-left cell */}
      <polyline
        points="160,210 180,190 200,200 220,170"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots in bottom-right cell */}
      <circle cx="330" cy="320" r="8" fill="white" />
      <circle cx="350" cy="300" r="8" fill="white" />
      <circle cx="370" cy="330" r="8" fill="white" />
      
      {/* Label */}
      <text
        x="256"
        y="420"
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="28"
        fontFamily="JetBrains Mono, monospace"
      >
        DASHBOARD
      </text>
    </g>
  );
};

// Subtle grid pattern for industrial feel
const GridPattern: React.FC = () => (
  <g opacity="0.05">
    {/* Horizontal lines */}
    {[...Array(16)].map((_, i) => (
      <line
        key={`h-${i}`}
        x1="0"
        y1={i * 32 + 16}
        x2="512"
        y2={i * 32 + 16}
        stroke="white"
        strokeWidth="1"
      />
    ))}
    {/* Vertical lines */}
    {[...Array(16)].map((_, i) => (
      <line
        key={`v-${i}`}
        x1={i * 32 + 16}
        y1="0"
        x2={i * 32 + 16}
        y2="512"
        stroke="white"
        strokeWidth="1"
      />
    ))}
  </g>
);

export default AppLogo;
