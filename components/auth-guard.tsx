'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'FOUNDER' | 'EXPERT' | 'TEAM_MEMBER';
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requiredRole,
  redirectTo = '/auth/signin'
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        router.push('/dashboard'); // Redirect to dashboard if role doesn't match
        return;
      }
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Show nothing if role doesn't match (will redirect)
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
} 