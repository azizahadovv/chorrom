import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RolePermissions } from '@/lib/permissions';
import { AccessDenied } from './AccessDenied';

interface ProtectedRouteProps {
  children: ReactNode;
  module: keyof RolePermissions;
  action?: 'view' | 'create' | 'edit' | 'delete';
}

export function ProtectedRoute({ children, module, action = 'view' }: ProtectedRouteProps) {
  const { hasPermission, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Tizimga kirilmagan (yoki chiqilgan) — kirish sahifasiga
  if (!userRole) return <Navigate to="/admin/auth" replace />;

  if (!hasPermission(module, action)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
