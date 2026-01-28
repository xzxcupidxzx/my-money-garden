import { useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';
import { TrendingUp } from 'lucide-react';
import type { Transaction } from '@/types/finance';

interface IncomePieChartProps {
  transactions: Transaction[];
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  icon: string;
}

export function IncomePieChart({ transactions }: IncomePieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const categoryBreakdown = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const breakdown: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    incomeTransactions.forEach(t => {
      const catId = t.category_id || 'uncategorized';
      const catName = t.category?.name || 'Khác';
      const catColor = t.category?.color || '#22c55e';
      const catIcon = t.category?.icon || 'TrendingUp';

      if (!breakdown[catId]) {
        breakdown[catId] = { name: catName, amount: 0, color: catColor, icon: catIcon };
      }
      breakdown[catId].amount += Number(t.amount);
    });

    // Only show categories with at least 1%
    return Object.values(breakdown)
      .map((item) => ({
        ...item,
        percentage: totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0,
      }))
      .filter(item => item.percentage >= 1)
      .sort((a, b) => b.amount - a.amount) as CategoryData[];
  }, [transactions]);

  const totalIncome = useMemo(() => 
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

        // Draw label with color dot and percentage
        const labelText = `${cat.percentage.toFixed(0)}%`;
        ctx.font = '600 11px Inter, system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        
        // Draw color dot
        const dotRadius = 5;
        
        if (isRightSide) {
          ctx.textAlign = 'left';
          // Draw color dot
          ctx.beginPath();
          ctx.arc(endX + 8, elbowY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = cat.color;
          ctx.fill();
          // Draw percentage text
          ctx.fillStyle = fgHsl;
          ctx.fillText(labelText, endX + 18, elbowY);
        } else {
          ctx.textAlign = 'right';
          // Draw percentage text
          ctx.fillStyle = fgHsl;
          ctx.fillText(labelText, endX - 18, elbowY);
          // Draw color dot
          ctx.beginPath();
          ctx.arc(endX - 8, elbowY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = cat.color;
          ctx.fill();
        }
      }

      currentAngle += sliceAngle;
    });

    // Draw center total
    ctx.fillStyle = fgHsl;
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const formattedTotal = totalIncome >= 1000000 
      ? `${(totalIncome / 1000000).toFixed(1)}Tr`
      : totalIncome >= 1000 
        ? `${(totalIncome / 1000).toFixed(0)}K`
        : totalIncome.toFixed(0);
    
    ctx.fillText(formattedTotal, centerX, centerY - 8);
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.fillStyle = mutedHsl;
    ctx.fillText('Tổng thu', centerX, centerY + 8);

  }, [categoryBreakdown, totalIncome, hoveredIndex]);

  if (categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-income" />
            Thu nhập theo danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Không có dữ liệu thu nhập</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-income" />
          Thu nhập theo danh mục
        </CardTitle>
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
            const IconComponent = AVAILABLE_ICONS[cat.icon] || AVAILABLE_ICONS['TrendingUp'];
            
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
                <span className="font-semibold text-sm text-income">
                  +<CurrencyDisplay amount={cat.amount} />
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
