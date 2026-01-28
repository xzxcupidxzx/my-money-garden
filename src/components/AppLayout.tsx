import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useBackgroundPattern } from '@/hooks/useBackgroundPattern';

export function AppLayout() {
  const { getPatternClass } = useBackgroundPattern();

  return (
    <div className={`min-h-screen pb-20 ${getPatternClass()}`}>
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
