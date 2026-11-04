import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch, getToken, setToken } from '@/lib/api';
import { AppRole, hasPermission, canViewModule, RolePermissions, Permission } from '@/lib/permissions';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'disabled';
}

interface AuthUser {
  id: string;
  email: string;
}

interface ApiUser extends UserProfile {
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  /** JWT (backend /api/auth/login) */
  session: { access_token: string } | null;
  loading: boolean;
  userRole: AppRole | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isManager: boolean;
  isSeller: boolean;
  hasPermission: (module: keyof RolePermissions, action: keyof Permission) => boolean;
  canViewModule: (module: keyof RolePermissions) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Saqlangan token bo'lsa — kimligini tekshiramiz (mehmon uchun hech qanday so'rov yo'q)
  useEffect(() => {
    const saved = getToken();
    if (!saved) {
      setLoading(false);
      return;
    }
    apiFetch<ApiUser>('/api/auth/me')
      .then((u) => {
        setProfile(u);
        setTokenState(saved);
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // Boshqa tabda chiqilsa (token o'chirilsa) — bu tabda ham darhol chiqiladi
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.newValue !== null) return;
      if (getToken()) return;
      setTokenState(null);
      setProfile(null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiFetch<{ token: string; user: ApiUser }>('/api/auth/login', {
        method: 'POST',
        json: { email, password },
        auth: false,
      });
      setToken(res.token);
      setTokenState(res.token);
      setProfile(res.user);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  // Ochiq ro'yxatdan o'tish yo'q: yangi xodimni admin "Adminlar" bo'limida qo'shadi
  const signUp = async () => ({
    error: new Error("Ro'yxatdan o'tish yopiq. Admin sizga akkaunt ochib beradi."),
  });

  const signOut = async () => {
    setToken(null);
    setTokenState(null);
    setProfile(null);
  };

  const userRole = profile?.role ?? null;
  const value: AuthContextType = {
    user: profile ? { id: profile.id, email: profile.email } : null,
    session: token ? { access_token: token } : null,
    loading,
    userRole,
    userProfile: profile ? { id: profile.id, name: profile.name, email: profile.email, status: profile.status } : null,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isSeller: userRole === 'seller',
    hasPermission: (module, action) => hasPermission(userRole, module, action),
    canViewModule: (module) => canViewModule(userRole, module),
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
