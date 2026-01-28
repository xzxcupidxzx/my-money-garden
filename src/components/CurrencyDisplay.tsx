import { usePrivacy } from '@/hooks/usePrivacy';

interface FormatCurrencyProps {
  amount: number;
  currency?: string;
  showSign?: boolean;
  className?: string;
}

export function formatCurrency(
  amount: number,
  currency: string = 'VND',
  showSign: boolean = false
): string {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }

  return formatted;
}

export function CurrencyDisplay({ amount, currency = 'VND', showSign = false, className }: FormatCurrencyProps) {
  const { privacyMode } = usePrivacy();

  if (privacyMode) {
    return <span className={`privacy-blur select-none ${className || ''}`}>••••••</span>;
  }

  return <span className={className}>{formatCurrency(amount, currency, showSign)}</span>;
}
