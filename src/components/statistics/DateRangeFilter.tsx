import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, subDays, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type TimeframeType = 'day' | 'month' | 'year' | 'custom';

interface DateRangeFilterProps {
  timeframe: TimeframeType;
  onTimeframeChange: (timeframe: TimeframeType) => void;
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export function DateRangeFilter({
  timeframe,
  onTimeframeChange,
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const [customStartOpen, setCustomStartOpen] = useState(false);
  const [customEndOpen, setCustomEndOpen] = useState(false);

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    onTimeframeChange(newTimeframe);
    const now = new Date();

    switch (newTimeframe) {
      case 'day':
        onDateRangeChange(startOfDay(now), endOfDay(now));
        break;
      case 'month':
        onDateRangeChange(startOfMonth(now), endOfMonth(now));
        break;
      case 'year':
        onDateRangeChange(startOfYear(now), endOfYear(now));
        break;
      // custom keeps current range
    }
  };

  const handlePrev = () => {
    switch (timeframe) {
      case 'day':
        const prevDay = subDays(startDate, 1);
        onDateRangeChange(startOfDay(prevDay), endOfDay(prevDay));
        break;
      case 'month':
        const prevMonth = subMonths(startDate, 1);
        onDateRangeChange(startOfMonth(prevMonth), endOfMonth(prevMonth));
        break;
      case 'year':
        const prevYear = subYears(startDate, 1);
        onDateRangeChange(startOfYear(prevYear), endOfYear(prevYear));
        break;
    }
  };

  const handleNext = () => {
    switch (timeframe) {
      case 'day':
        const nextDay = addDays(startDate, 1);
        onDateRangeChange(startOfDay(nextDay), endOfDay(nextDay));
        break;
      case 'month':
        const nextMonth = addMonths(startDate, 1);
        onDateRangeChange(startOfMonth(nextMonth), endOfMonth(nextMonth));
        break;
      case 'year':
        const nextYear = addYears(startDate, 1);
        onDateRangeChange(startOfYear(nextYear), endOfYear(nextYear));
        break;
    }
  };

  const getDateLabel = () => {
    switch (timeframe) {
      case 'day':
        return format(startDate, 'EEEE, dd/MM/yyyy', { locale: vi });
      case 'month':
        return format(startDate, 'MMMM yyyy', { locale: vi });
      case 'year':
        return format(startDate, 'yyyy');
      case 'custom':
        return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    }
  };

  return (
    <div className="space-y-3">
      {/* Timeframe Tabs */}
      <Tabs value={timeframe} onValueChange={(v) => handleTimeframeChange(v as TimeframeType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="day">Ngày</TabsTrigger>
          <TabsTrigger value="month">Tháng</TabsTrigger>
          <TabsTrigger value="year">Năm</TabsTrigger>
          <TabsTrigger value="custom">Tuỳ chọn</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Navigation for day/month/year */}
      {timeframe !== 'custom' && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold capitalize">{getDateLabel()}</span>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Custom date pickers */}
      {timeframe === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover open={customStartOpen} onOpenChange={setCustomStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  if (date) {
                    onDateRangeChange(startOfDay(date), endDate);
                    setCustomStartOpen(false);
                  }
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">→</span>

          <Popover open={customEndOpen} onOpenChange={setCustomEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(endDate, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  if (date) {
                    onDateRangeChange(startDate, endOfDay(date));
                    setCustomEndOpen(false);
                  }
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
