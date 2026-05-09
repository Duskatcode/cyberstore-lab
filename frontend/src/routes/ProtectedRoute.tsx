import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/auth.store';
import type { UserRole } from '../types/auth.types';

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}
