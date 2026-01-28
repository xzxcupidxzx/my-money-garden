import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  PieChart, 
  Briefcase, 
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Giao dịch' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/utilities', icon: Zap, label: 'Điện nước' },
  { to: '/management', icon: Briefcase, label: 'Quản lý' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 safe-bottom z-50">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-all",
              location.pathname === item.to && "text-primary"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-sm transition-all",
              location.pathname === item.to && "bg-primary/10"
            )}>
              <item.icon className="h-5 w-5" />
              {location.pathname === item.to && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-mono uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}

        {/* AI Note Button - Center with industrial styling */}
        <NavLink
          to="/ai-note"
          className="flex items-center justify-center -mt-4"
        >
          <div className="relative">
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary/50" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-primary/50" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-primary/50" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary/50" />
            
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 rounded-sm shadow-lg bg-primary hover:bg-primary/90",
                location.pathname === '/ai-note' && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </div>
        </NavLink>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-all",
              location.pathname === item.to && "text-primary"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-sm transition-all",
              location.pathname === item.to && "bg-primary/10"
            )}>
              <item.icon className="h-5 w-5" />
              {location.pathname === item.to && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-mono uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
