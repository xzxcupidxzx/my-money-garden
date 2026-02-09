import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useBackgroundPattern } from '@/hooks/useBackgroundPattern';

export function AppLayout() {
  const { getPatternClass } = useBackgroundPattern();

  return (
    <div className={`min-h-screen ${getPatternClass()}`} style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
