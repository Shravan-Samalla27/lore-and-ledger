'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type UserRole = 'admin' | 'librarian' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  scholarId: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (
    email: string,
    password: string,
    requiredRole?: UserRole | UserRole[]
  ) => Promise<{
    success: boolean;
    user?: User;
    profile?: UserProfile | null;
    error?: string;
  }>;
  signUpStudent: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    success: boolean;
    user?: User;
    isEmailConfirmationRequired?: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error querying profiles table:', error.message);
        return null;
      }

      if (data) {
        const validRoles: UserRole[] = ['admin', 'librarian', 'student'];
        const validatedRole: UserRole = validRoles.includes(data.role as UserRole)
          ? (data.role as UserRole)
          : 'student';

        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name || '',
          role: validatedRole,
          scholarId: data.scholar_id || null
        };
      }

      // Default fallback if profile row is still being populated by trigger
      return {
        id: userId,
        email: userEmail,
        fullName: '',
        role: 'student',
        scholarId: null
      };
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const prof = await fetchProfile(user.id, user.email || '');
    setProfile(prof);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Retrieve active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        const prof = await fetchProfile(session.user.id, session.user.email || '');
        if (isMounted) {
          setUser(session.user);
          setProfile(prof);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state transitions (sign in, sign out, token refresh)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const prof = await fetchProfile(session.user.id, session.user.email || '');
        if (isMounted) {
          setUser(session.user);
          setProfile(prof);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  const signIn = async (
    email: string,
    password: string,
    requiredRole?: UserRole | UserRole[]
  ): Promise<{ success: boolean; user?: User; profile?: UserProfile | null; error?: string }> => {
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.'
      };
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both your email address and password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        let userFriendlyError = error.message;

        if (error.message.toLowerCase().includes('invalid login credentials')) {
          userFriendlyError =
            'Invalid login credentials. This occurs if:\n' +
            '1. The user account has not been registered yet in Supabase Auth.\n' +
            '2. The password was entered incorrectly.\n' +
            '3. "Confirm email" is enabled in Supabase and the email has not been verified yet.';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          userFriendlyError =
            'Email not confirmed. Please check your inbox for the verification link, or disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email).';
        } else if (error.message.toLowerCase().includes('failed to fetch')) {
          userFriendlyError =
            'Network failure: Unable to reach your Supabase project. Please check your internet connection and verify NEXT_PUBLIC_SUPABASE_URL in .env.local.';
        }

        return { success: false, error: userFriendlyError };
      }

      if (data.user) {
        const prof = await fetchProfile(data.user.id, data.user.email || cleanEmail);

        // Strict portal role verification
        if (requiredRole) {
          const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          if (!prof || !allowed.includes(prof.role)) {
            // Immediately deny access and sign out the unauthorized session safely
            try {
              await supabase.auth.signOut();
            } catch (signoutErr) {
              console.warn('Sign out cleanup error on role mismatch:', signoutErr);
            }
            setUser(null);
            setProfile(null);
            return {
              success: false,
              error: 'Access denied: your account is not authorized for this portal'
            };
          }
        }

        setUser(data.user);
        setProfile(prof);
        return { success: true, user: data.user, profile: prof };
      }

      return { success: false, error: 'Login did not return a valid user session.' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'An unexpected network error occurred during authentication.'
      };
    }
  };

  const signUpStudent = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{
    success: boolean;
    user?: User;
    isEmailConfirmationRequired?: boolean;
    error?: string;
  }> => {
    if (!supabase) {
      return {
        success: false,
        error: 'Database credentials not configured in .env.local.'
      };
    }

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: 'Please provide full name, email, and password.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters in length.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName
            // Note: Server-side database trigger strictly enforces the 'student' role.
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required (session is null when email confirmation is pending)
      const isEmailConfirmationRequired = !data.session;

      if (data.user) {
        if (data.session) {
          setUser(data.user);
          const prof = await fetchProfile(data.user.id, cleanEmail);
          setProfile(prof);
        }
        return {
          success: true,
          user: data.user,
          isEmailConfirmationRequired
        };
      }

      return { success: true, isEmailConfirmationRequired };
    } catch (err: any) {
      return { success: false, error: err.message || 'Matriculation registration failed.' };
    }
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        isLoading,
        isConfigured,
        signIn,
        signUpStudent,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
