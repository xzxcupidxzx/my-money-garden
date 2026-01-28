import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Zap, Droplets, Save, RotateCcw } from 'lucide-react';
import { ElectricityTier, PriceSettings as PriceSettingsType, DEFAULT_ELECTRICITY_TIERS, DEFAULT_WATER_PRICE } from '@/hooks/useUtilities';

interface PriceSettingsProps {
  priceSettings: PriceSettingsType | null;
  onSave: (settings: Partial<PriceSettingsType>) => Promise<boolean>;
}

export function PriceSettings({ priceSettings, onSave }: PriceSettingsProps) {
  const [tiers, setTiers] = useState<ElectricityTier[]>(DEFAULT_ELECTRICITY_TIERS);
  const [vatPercent, setVatPercent] = useState(10);
  const [waterPrice, setWaterPrice] = useState(DEFAULT_WATER_PRICE);
  const [waterIncludesVat, setWaterIncludesVat] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (priceSettings) {
      setTiers(priceSettings.electricity_tiers);
      setVatPercent(priceSettings.electricity_vat_percent);
      setWaterPrice(priceSettings.water_price);
      setWaterIncludesVat(priceSettings.water_includes_vat);
    }
  }, [priceSettings]);

  const handleTierChange = (index: number, field: 'price' | 'limit', value: string) => {
    const newTiers = [...tiers];
    if (field === 'price') {
      newTiers[index].price = parseInt(value) || 0;
    } else if (field === 'limit') {
      newTiers[index].limit = value === '' ? null : parseInt(value) || null;
    }
    setTiers(newTiers);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      electricity_tiers: tiers,
      electricity_vat_percent: vatPercent,
      water_price: waterPrice,
      water_includes_vat: waterIncludesVat,
    });
    setSaving(false);
  };

  const handleReset = () => {
    setTiers(DEFAULT_ELECTRICITY_TIERS);
    setVatPercent(10);
    setWaterPrice(DEFAULT_WATER_PRICE);
    setWaterIncludesVat(true);
  };

  return (
    <div className="space-y-4">
      {/* Electricity Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Biểu giá điện
          </CardTitle>
          <CardDescription>
            Điều chỉnh giá điện theo bậc thang (TP.HCM 2025)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tiers.map((tier, index) => (
            <div key={tier.tier} className="grid grid-cols-3 gap-2 items-center">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tier.name} ({tier.range})
                </Label>
              </div>
              <div>
                <Input
                  type="number"
                  value={tier.limit || ''}
                  onChange={(e) => handleTierChange(index, 'limit', e.target.value)}
                  placeholder="∞"
                  className="h-9"
                  disabled={index === tiers.length - 1}
                />
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={tier.price}
                  onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                  className="h-9"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">đ/kWh</span>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <Label>VAT điện (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                className="w-20 h-9"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Giá nước
          </CardTitle>
          <CardDescription>
            Đơn giá nước cố định (đã bao gồm phí thoát nước)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Đơn giá nước</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={waterPrice}
                onChange={(e) => setWaterPrice(parseFloat(e.target.value) || 0)}
                className="w-32 h-9"
              />
              <span className="text-sm text-muted-foreground">đ/m³</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Đã bao gồm VAT</Label>
            <Switch
              checked={waterIncludesVat}
              onCheckedChange={setWaterIncludesVat}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Đặt lại mặc định
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </div>
    </div>
  );
}
