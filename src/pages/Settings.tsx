import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { usePrivacy } from '@/hooks/usePrivacy';
import { ThemeColorPicker } from '@/components/settings/ThemeColorPicker';
import { BackgroundPatternPicker } from '@/components/settings/BackgroundPatternPicker';
import { 
  FontSizePicker, 
  NumberFormatPicker, 
  WeekStartPicker, 
  DefaultAccountPicker,
  NotificationToggle 
} from '@/components/settings/AppPreferencesPicker';
import { 
  User, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  LogOut,
  Shield,
  ChevronRight,
  Scale,
  HardDrive,
  Tags,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { privacyMode, togglePrivacy, profile, updateProfile } = usePrivacy();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

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

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    updateProfile({ theme: next });
  };

  if (!user) return null;

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h1 className="text-2xl font-bold">Cài đặt</h1>
      </div>

      {/* User Profile */}
      <Card className="card-technical">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{profile?.full_name || 'Người dùng'}</p>
              <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
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


      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Giao diện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Chế độ sáng/tối</p>
                <p className="text-sm text-muted-foreground capitalize">{theme}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Đổi
            </Button>
          </div>

          {/* Theme Color Picker */}
          <ThemeColorPicker />

          {/* Background Pattern Picker */}
          <BackgroundPatternPicker />

          {/* Font Size */}
          <FontSizePicker />
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tùy chọn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number Format */}
          <NumberFormatPicker />

          {/* Week Start */}
          <WeekStartPicker />

          {/* Default Account */}
          <DefaultAccountPicker />

          {/* Notifications */}
          <NotificationToggle />

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

      {/* Security */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="h-5 w-5 mr-3" />
            Bảo mật tài khoản
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
