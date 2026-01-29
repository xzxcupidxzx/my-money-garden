import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TECH_ICONS, TechIconName } from './TechIcons';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';
import { MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Group icons by purpose
const TECH_ICON_GROUPS = {
  'Danh mục': ['IconFood', 'IconShopping', 'IconTransport', 'IconEntertainment', 'IconBills', 'IconHealth', 'IconEducation', 'IconIncome', 'IconExpense', 'IconGift'],
  'Tài khoản': ['IconCash', 'IconBank', 'IconCard', 'IconEWallet', 'IconSavings', 'IconInvestment'],
  'Giao diện': ['IconDashboard', 'IconSettings', 'IconStatistics', 'IconHistory', 'IconTransfer', 'IconAdd', 'IconBudget', 'IconAI', 'IconRecurring', 'IconHome'],
} as const;

interface TechIconPickerProps {
  value: string;
  onChange: (icon: string, isTechIcon: boolean) => void;
  color?: string;
}

export function TechIconPicker({ value, onChange, color = '#64748b' }: TechIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'tech' | 'lucide'>('tech');

  // Determine if current value is a tech icon
  const isTechIcon = value.startsWith('Icon') && value in TECH_ICONS;
  
  // Render selected icon
  const renderSelectedIcon = () => {
    if (isTechIcon) {
      const TechIcon = TECH_ICONS[value as TechIconName];
      return <TechIcon size={24} color={color} />;
    } else {
      const LucideIcon = AVAILABLE_ICONS[value] || MoreHorizontal;
      return <LucideIcon className="h-6 w-6" style={{ color }} />;
    }
  };

  // Filter icons by search
  const filteredTechIcons = Object.entries(TECH_ICON_GROUPS).reduce((acc, [group, icons]) => {
    const filtered = icons.filter(name => 
      name.toLowerCase().includes(search.toLowerCase()) ||
      group.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const filteredLucideIcons = Object.keys(AVAILABLE_ICONS).filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-lg relative"
          style={{ backgroundColor: `${color}15` }}
        >
          {renderSelectedIcon()}
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: `${color}40` }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: `${color}40` }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: `${color}40` }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: `${color}40` }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm icon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tech' | 'lucide')} className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="tech" className="flex-1 text-xs">
              🔧 Tech Style
            </TabsTrigger>
            <TabsTrigger value="lucide" className="flex-1 text-xs">
              ✨ Lucide
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tech" className="p-2 max-h-64 overflow-y-auto">
            {Object.entries(filteredTechIcons).map(([group, icons]) => (
              <div key={group} className="mb-3">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {group}
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {icons.map((name) => {
                    const Icon = TECH_ICONS[name as TechIconName];
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          onChange(name, true);
                          setOpen(false);
                        }}
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center transition-colors hover:bg-muted",
                          value === name && "bg-primary/10 ring-2 ring-primary"
                        )}
                        title={name.replace('Icon', '')}
                      >
                        <Icon size={20} color={color} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {Object.keys(filteredTechIcons).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                Không tìm thấy icon
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="lucide" className="p-2 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-6 gap-1">
              {filteredLucideIcons.map((name) => {
                const Icon = AVAILABLE_ICONS[name];
                return (
                  <button
                    key={name}
                    onClick={() => {
                      onChange(name, false);
                      setOpen(false);
                    }}
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center transition-colors hover:bg-muted",
                      value === name && "bg-primary/10 ring-2 ring-primary"
                    )}
                    title={name}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </button>
                );
              })}
            </div>
            {filteredLucideIcons.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                Không tìm thấy icon
              </p>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
