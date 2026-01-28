import { useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';
import type { Transaction } from '@/types/finance';

interface EnhancedPieChartProps {
  transactions: Transaction[];
  title: string;
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  icon: string;
}

// Draw lucide icon on canvas
function drawIconOnCanvas(
  ctx: CanvasRenderingContext2D,
  iconName: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 24; // scale factor
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(s, s);

  // Draw simple shapes for common icons
  switch (iconName) {
    case 'ShoppingCart':
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(3, 6);
      ctx.lineTo(5, 13);
      ctx.lineTo(16, 13);
      ctx.lineTo(18, 7);
      ctx.lineTo(8, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, 18, 2, 0, Math.PI * 2);
      ctx.arc(14, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'Utensils':
    case 'UtensilsCrossed':
      ctx.beginPath();
      ctx.moveTo(8, 3);
      ctx.lineTo(8, 12);
      ctx.moveTo(5, 3);
      ctx.lineTo(5, 8);
      ctx.lineTo(8, 11);
      ctx.moveTo(11, 3);
      ctx.lineTo(11, 8);
      ctx.lineTo(8, 11);
      ctx.moveTo(8, 12);
      ctx.lineTo(8, 21);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.lineTo(16, 21);
      ctx.moveTo(16, 3);
      ctx.quadraticCurveTo(20, 6, 16, 10);
      ctx.stroke();
      break;
    case 'Home':
      ctx.beginPath();
      ctx.moveTo(3, 12);
      ctx.lineTo(12, 3);
      ctx.lineTo(21, 12);
      ctx.moveTo(6, 10);
      ctx.lineTo(6, 20);
      ctx.lineTo(18, 20);
      ctx.lineTo(18, 10);
      ctx.stroke();
      break;
    case 'Car':
    case 'Bus':
      ctx.beginPath();
      ctx.moveTo(5, 11);
      ctx.lineTo(5, 7);
      ctx.quadraticCurveTo(5, 5, 7, 5);
      ctx.lineTo(17, 5);
      ctx.quadraticCurveTo(19, 5, 19, 7);
      ctx.lineTo(19, 11);
      ctx.lineTo(5, 11);
      ctx.moveTo(4, 11);
      ctx.lineTo(20, 11);
      ctx.lineTo(20, 16);
      ctx.lineTo(4, 16);
      ctx.lineTo(4, 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7, 16, 2, 0, Math.PI * 2);
      ctx.arc(17, 16, 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'Coffee':
      ctx.beginPath();
      ctx.moveTo(5, 6);
      ctx.lineTo(5, 15);
      ctx.quadraticCurveTo(5, 18, 9, 18);
      ctx.lineTo(13, 18);
      ctx.quadraticCurveTo(17, 18, 17, 15);
      ctx.lineTo(17, 6);
      ctx.lineTo(5, 6);
      ctx.moveTo(17, 8);
      ctx.quadraticCurveTo(21, 8, 21, 11);
      ctx.quadraticCurveTo(21, 14, 17, 14);
      ctx.stroke();
      break;
    case 'Gamepad2':
    case 'Gamepad':
      ctx.beginPath();
      ctx.rect(4, 8, 16, 10);
      ctx.moveTo(9, 11);
      ctx.lineTo(9, 15);
      ctx.moveTo(7, 13);
      ctx.lineTo(11, 13);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(16, 11, 1.5, 0, Math.PI * 2);
      ctx.arc(18, 14, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'Heart':
      ctx.beginPath();
      ctx.moveTo(12, 20);
      ctx.bezierCurveTo(4, 14, 4, 8, 8, 5);
      ctx.bezierCurveTo(10, 4, 12, 6, 12, 8);
      ctx.bezierCurveTo(12, 6, 14, 4, 16, 5);
      ctx.bezierCurveTo(20, 8, 20, 14, 12, 20);
      ctx.stroke();
      break;
    case 'Zap':
      ctx.beginPath();
      ctx.moveTo(13, 2);
      ctx.lineTo(3, 14);
      ctx.lineTo(12, 14);
      ctx.lineTo(11, 22);
      ctx.lineTo(21, 10);
      ctx.lineTo(12, 10);
      ctx.lineTo(13, 2);
      ctx.stroke();
      break;
    case 'Gift':
      ctx.beginPath();
      ctx.rect(3, 8, 18, 4);
      ctx.rect(5, 12, 14, 8);
      ctx.moveTo(12, 8);
      ctx.lineTo(12, 20);
      ctx.stroke();
      break;
    default:
      // Default: draw a circle for unknown icons
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.stroke();
  }

  ctx.restore();
}

export function EnhancedPieChart({ transactions, title }: EnhancedPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const categoryBreakdown = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const breakdown: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    expenseTransactions.forEach(t => {
      const catId = t.category_id || 'uncategorized';
      const catName = t.category?.name || 'Khác';
      const catColor = t.category?.color || '#64748b';
      const catIcon = t.category?.icon || 'MoreHorizontal';

      if (!breakdown[catId]) {
        breakdown[catId] = { name: catName, amount: 0, color: catColor, icon: catIcon };
      }
      breakdown[catId].amount += Number(t.amount);
    });

    // Only show categories with at least 1%
    return Object.values(breakdown)
      .map((item) => ({
        ...item,
        percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
      }))
      .filter(item => item.percentage >= 1)
      .sort((a, b) => b.amount - a.amount) as CategoryData[];
  }, [transactions]);

  const totalAmount = useMemo(() => 
    categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0), 
    [categoryBreakdown]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || categoryBreakdown.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 50;
    const innerRadius = outerRadius * 0.6;

    // Get computed styles for theme colors
    const computedStyle = getComputedStyle(document.documentElement);
    const foregroundColor = computedStyle.getPropertyValue('--foreground').trim();
    const mutedForegroundColor = computedStyle.getPropertyValue('--muted-foreground').trim();
    
    // Parse HSL values
    const fgHsl = foregroundColor ? `hsl(${foregroundColor})` : '#ffffff';
    const mutedHsl = mutedForegroundColor ? `hsl(${mutedForegroundColor})` : '#94a3b8';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw doughnut segments
    let currentAngle = -Math.PI / 2;

    categoryBreakdown.forEach((cat, index) => {
      const sliceAngle = (cat.percentage / 100) * 2 * Math.PI;
      const isHovered = hoveredIndex === index;
      const radiusOffset = isHovered ? 5 : 0;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + radiusOffset, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius + radiusOffset, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = cat.color;
      ctx.fill();

      // Draw leader lines and labels for segments >= 3%
      if (cat.percentage >= 3) {
        const midAngle = currentAngle + sliceAngle / 2;
        const isRightSide = Math.cos(midAngle) >= 0;
        
        // Start point on outer edge
        const startX = centerX + Math.cos(midAngle) * (outerRadius + 5);
        const startY = centerY + Math.sin(midAngle) * (outerRadius + 5);
        
        // Elbow point
        const elbowX = centerX + Math.cos(midAngle) * (outerRadius + 20);
        const elbowY = centerY + Math.sin(midAngle) * (outerRadius + 20);
        
        // End point (horizontal extension)
        const endX = isRightSide ? elbowX + 30 : elbowX - 30;

        // Draw leader line with better visibility
        ctx.strokeStyle = mutedHsl;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(endX, elbowY);
        ctx.stroke();

        // Draw label with icon and percentage
        const labelText = `${cat.percentage.toFixed(0)}%`;
        ctx.font = '600 11px Inter, system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        
        if (isRightSide) {
          ctx.textAlign = 'left';
          // Draw icon
          drawIconOnCanvas(ctx, cat.icon, endX + 10, elbowY, 14, cat.color);
          // Draw percentage text
          ctx.fillStyle = fgHsl;
          ctx.fillText(labelText, endX + 20, elbowY);
        } else {
          ctx.textAlign = 'right';
          const textWidth = ctx.measureText(labelText).width;
          // Draw percentage text
          ctx.fillStyle = fgHsl;
          ctx.fillText(labelText, endX - 20, elbowY);
          // Draw icon
          drawIconOnCanvas(ctx, cat.icon, endX - 10, elbowY, 14, cat.color);
        }
      }

      currentAngle += sliceAngle;
    });

    // Draw center total
    ctx.fillStyle = fgHsl;
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const formattedTotal = totalAmount >= 1000000 
      ? `${(totalAmount / 1000000).toFixed(1)}Tr`
      : totalAmount >= 1000 
        ? `${(totalAmount / 1000).toFixed(0)}K`
        : totalAmount.toFixed(0);
    
    ctx.fillText(formattedTotal, centerX, centerY - 8);
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.fillStyle = mutedHsl;
    ctx.fillText('Tổng chi', centerX, centerY + 8);

  }, [categoryBreakdown, totalAmount, hoveredIndex]);

  if (categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Không có dữ liệu chi tiêu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Canvas Chart */}
        <div className="relative h-64 mb-4">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Category Legend List */}
        <div className="space-y-2">
          {categoryBreakdown.map((cat, index) => {
            const IconComponent = AVAILABLE_ICONS[cat.icon] || AVAILABLE_ICONS['MoreHorizontal'];
            
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <IconComponent className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{cat.name}</span>
                    <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  <CurrencyDisplay amount={cat.amount} />
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
