import { usePrivacy } from '@/hooks/usePrivacy';
import { cn } from '@/lib/utils';

interface PrivacyTextProps {
  children: React.ReactNode;
  className?: string;
}

export function PrivacyText({ children, className }: PrivacyTextProps) {
  const { privacyMode } = usePrivacy();

  return (
    <span className={cn(privacyMode && 'privacy-blur select-none', className)}>
      {children}
    </span>
  );
}
