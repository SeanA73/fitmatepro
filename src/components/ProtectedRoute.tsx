import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AccountPaused } from '@/components/AccountPaused';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // A paused account keeps its session but sees none of the app.
  //
  // Gated here rather than at sign-in because Supabase auth has no hook to
  // reject a password grant on an application-level flag, and blocking the token
  // outright would leave the user unable to reactivate themselves. They stay
  // signed in and get one screen: reactivate, or sign out.
  //
  // /profile is exempt so the settings page — where Reactivate also lives — is
  // still reachable, and so pausing does not lock the user out of the very
  // screen they used to pause.
  if (user && profile?.account_status === 'paused' && location.pathname !== '/profile') {
    return <AccountPaused />;
  }

  return <>{children}</>;
};





