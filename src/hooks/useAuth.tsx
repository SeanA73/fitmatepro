import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  fitness_goals?: string[];
  health_conditions?: string[];
  subscription_plan?: string;
  created_at: string;
  updated_at: string;
}

interface SignUpAdditionalData {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  fitness_goals?: string[];
  health_conditions?: string[];
}

interface AuthResponse {
  data: { user: User | null; session: Session | null } | null;
  error: Error | null;
}

// updateProfile returns the updated profiles row, not an auth session — it needs
// its own response type. It was previously declared as AuthResponse, which only
// type-checked because the stale generated types made the row shape unknown.
interface ProfileResponse {
  data: Profile | null;
  error: Error | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, additionalData?: SignUpAdditionalData) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<ProfileResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(
          session.user.id,
          session.user.email ?? undefined,
          (session.user.user_metadata as Record<string, unknown>)?.full_name as string | undefined
        );
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer any Supabase calls to avoid deadlocks inside the callback
          setTimeout(() => {
            fetchProfile(
              session.user!.id,
              session.user!.email ?? undefined,
              (session.user!.user_metadata as Record<string, unknown>)?.full_name as string | undefined
            );
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (userId: string, email?: string, fullName?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Profile doesn't exist, create a minimal one
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: email ?? user?.email ?? '',
            full_name: fullName ?? ((user?.user_metadata as Record<string, unknown>)?.full_name as string | undefined) ?? '',
            date_of_birth: null,
            gender: null,
            height_cm: null,
            weight_kg: null,
            activity_level: null,
            fitness_goals: [],
            health_conditions: []
          }])
          .select()
          .single();

        if (insertError) {
          return;
        }

        if (newProfile) {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      // Silent fail for profile operations
    }
  };

  const signUp = async (email: string, password: string, additionalData: SignUpAdditionalData = {}): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: additionalData
        }
      });

      if (error) throw error;

      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email!,
            full_name: additionalData.full_name || '',
            date_of_birth: additionalData.date_of_birth || null,
            gender: additionalData.gender || null,
            height_cm: additionalData.height_cm || null,
            weight_kg: additionalData.weight_kg || null,
            activity_level: additionalData.activity_level || null,
            fitness_goals: additionalData.fitness_goals || [],
            health_conditions: additionalData.health_conditions || []
          }]);

        if (profileError) {
          // Silent fail for profile creation
        }
      }

      toast({
        title: "Welcome to FitMatePro!",
        description: "Your account has been created successfully.",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to FitMatePro.",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear state first
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "See you next time!",
      });
      
      // Force redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<ProfileResponse> => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};