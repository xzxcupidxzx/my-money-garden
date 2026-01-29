import { TechIconDemo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IconDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold font-mono">ICON_SYSTEM</h1>
            <p className="text-xs text-muted-foreground">Industrial-Tech Style</p>
          </div>
        </div>
      </div>
      
      <TechIconDemo />
    </div>
  );
}
