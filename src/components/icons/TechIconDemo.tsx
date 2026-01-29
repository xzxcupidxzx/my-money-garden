import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TECH_ICONS, TechIconName } from './TechIcons';

const DEMO_GROUPS = {
  'Danh mục Chi tiêu': {
    icons: ['IconFood', 'IconShopping', 'IconTransport', 'IconEntertainment', 'IconBills', 'IconHealth', 'IconEducation', 'IconGift'],
    color: 'hsl(var(--expense))',
  },
  'Danh mục Thu nhập': {
    icons: ['IconIncome', 'IconExpense'],
    color: 'hsl(var(--income))',
  },
  'Tài khoản': {
    icons: ['IconCash', 'IconBank', 'IconCard', 'IconEWallet', 'IconSavings', 'IconInvestment'],
    color: 'hsl(var(--primary))',
  },
  'Giao diện': {
    icons: ['IconDashboard', 'IconSettings', 'IconStatistics', 'IconHistory', 'IconTransfer', 'IconAdd', 'IconBudget', 'IconAI', 'IconRecurring', 'IconHome'],
    color: 'hsl(var(--foreground))',
  },
} as const;

export function TechIconDemo() {
  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-mono tracking-tight">
          TECH_ICON_SYSTEM
        </h1>
        <p className="text-muted-foreground text-sm font-mono">
          Industrial-Tech / HUD / Blueprint Style Icons
        </p>
      </div>

      {Object.entries(DEMO_GROUPS).map(([groupName, { icons, color }]) => (
        <Card key={groupName} className="card-technical">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">
              {groupName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {icons.map((iconName) => {
                const Icon = TECH_ICONS[iconName as TechIconName];
                return (
                  <div
                    key={iconName}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center relative"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={28} color={color} strokeWidth={1.5} />
                      {/* Corner markers */}
                      <div 
                        className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" 
                        style={{ borderColor: `${color}40` }} 
                      />
                      <div 
                        className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" 
                        style={{ borderColor: `${color}40` }} 
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground text-center">
                      {iconName.replace('Icon', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Size comparison */}
      <Card className="card-hud">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider">
            Size Variants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-8 justify-center py-4">
            {[16, 20, 24, 32, 48].map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <TECH_ICONS.IconDashboard size={size} color="hsl(var(--primary))" />
                <span className="text-xs font-mono text-muted-foreground">{size}px</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color showcase */}
      <Card className="card-hud">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider">
            Color System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 justify-center py-4 flex-wrap">
            {[
              { name: 'Primary', color: 'hsl(var(--primary))' },
              { name: 'Income', color: 'hsl(var(--income))' },
              { name: 'Expense', color: 'hsl(var(--expense))' },
              { name: 'Transfer', color: 'hsl(var(--transfer))' },
              { name: 'Muted', color: 'hsl(var(--muted-foreground))' },
            ].map(({ name, color }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <TECH_ICONS.IconBudget size={28} color={color} />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
