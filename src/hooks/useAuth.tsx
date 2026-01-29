import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Single-user mode: ID cố định cho user duy nhất khi self-host
const SINGLE_USER_ID = 'single-user-mode';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSingleUserMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kiểm tra nếu đang chạy trong môi trường self-host (không có Lovable Cloud)
const isSelfHosted = () => {
  const url = window.location.hostname;
  // Nếu không phải lovable.app hoặc localhost với Supabase Cloud thì là self-host
  return !url.includes('lovable.app') && !url.includes('lovableproject.com');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSingleUserMode, setIsSingleUserMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Kiểm tra single-user mode từ localStorage hoặc self-host detection
    const singleUserEnabled = localStorage.getItem('single-user-mode') === 'true' || isSelfHosted();
    
    if (singleUserEnabled) {
      // Single-user mode: tạo user ảo, không cần đăng nhập
      setIsSingleUserMode(true);
      
      // Lấy user thật từ Supabase nếu có, nếu không thì dùng user ảo
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else {
          // Tạo user ảo cho single-user mode
          const mockUser: User = {
            id: SINGLE_USER_ID,
            email: 'single-user@local.app',
            app_metadata: {},
            user_metadata: { full_name: 'Single User' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User;
          setUser(mockUser);
        }
        setLoading(false);
      });

      // Vẫn lắng nghe auth changes để hỗ trợ chuyển đổi
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
          }
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Multi-user mode: hoạt động bình thường
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Tạo tài khoản thành công!",
        description: "Chào mừng đến với Finance Tracker.",
      });

      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Đăng ký thất bại",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Chào mừng trở lại!",
        description: "Đăng nhập thành công.",
      });

      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Đăng nhập thất bại",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    if (!isSingleUserMode) {
      await supabase.auth.signOut();
    }
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isSingleUserMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
