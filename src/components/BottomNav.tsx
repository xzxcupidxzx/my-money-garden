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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors",
              location.pathname === item.to && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}

        {/* AI Note Button - Center */}
        <NavLink
          to="/ai-note"
          className="flex items-center justify-center -mt-4"
        >
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80",
              location.pathname === '/ai-note' && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </NavLink>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors",
              location.pathname === item.to && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
