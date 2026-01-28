import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { usePrivacy } from '@/hooks/usePrivacy';
import { useAccounts } from '@/hooks/useAccounts';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { 
  User, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  Wallet, 
  LogOut,
  CreditCard,
  Plus,
  Shield,
  Bell,
  ChevronRight,
  Scale,
  HardDrive,
  Tags,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { privacyMode, togglePrivacy, profile, updateProfile } = usePrivacy();
  const { accounts, totalBalance, addAccount } = useAccounts();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAddAccount = async () => {
    if (!newAccountName) return;
    
    await addAccount({
      name: newAccountName,
      type: 'cash',
      balance: parseFloat(newAccountBalance) || 0,
      currency: 'VND',
      icon: null,
      color: null,
      is_active: true,
    });

    setNewAccountName('');
    setNewAccountBalance('');
    setShowAddAccount(false);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    updateProfile({ theme: next });
  };

  if (!user) return null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Cài đặt</h1>

      {/* User Profile */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{profile?.full_name || 'Người dùng'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quản lý dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Link to="/categories">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <Tags className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Danh mục</p>
                  <p className="text-xs text-muted-foreground">Quản lý danh mục thu chi</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>

          <Link to="/reconciliation">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Đối soát Tài khoản</p>
                  <p className="text-xs text-muted-foreground">So sánh số dư thực tế</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>

          <Link to="/backup">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Sao lưu & Khôi phục</p>
                  <p className="text-xs text-muted-foreground">Save/Load dữ liệu</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Accounts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Tài khoản
            </CardTitle>
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm tài khoản mới</DialogTitle>
                  <DialogDescription>
                    Tạo tài khoản mới để theo dõi số dư
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên tài khoản</Label>
                    <Input
                      id="name"
                      placeholder="Ví dụ: Tiền mặt, Ngân hàng..."
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance">Số dư ban đầu</Label>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="0"
                      value={newAccountBalance}
                      onChange={(e) => setNewAccountBalance(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddAccount}>Thêm tài khoản</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium">{account.name}</span>
              </div>
              <CurrencyDisplay amount={Number(account.balance)} className="font-semibold" />
            </div>
          ))}
          
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <CurrencyDisplay amount={totalBalance} className="text-lg font-bold text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tùy chọn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Giao diện</p>
                <p className="text-sm text-muted-foreground capitalize">{theme}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Đổi
            </Button>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {privacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <div>
                <p className="font-medium">Chế độ riêng tư</p>
                <p className="text-sm text-muted-foreground">Ẩn số tiền</p>
              </div>
            </div>
            <Switch checked={privacyMode} onCheckedChange={togglePrivacy} />
          </div>
        </CardContent>
      </Card>

      {/* Data & Security */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="h-5 w-5 mr-3" />
            Bảo mật tài khoản
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="h-5 w-5 mr-3" />
            Thông báo
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Đăng xuất
      </Button>
    </div>
  );
}
