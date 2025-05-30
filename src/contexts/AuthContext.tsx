
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  full_name?: string;
  age?: number;
  gender?: string;
  address?: string;
  image_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        
        if (session?.user) {
          // Create user object from auth data
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as UserRole) || 'customer',
            full_name: session.user.user_metadata?.full_name,
          };
          
          console.log('User authenticated successfully:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Try to create/update profile in background (don't block auth on this)
          setTimeout(() => {
            createOrUpdateProfile(session.user, userData.role);
          }, 0);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Will trigger the auth state change listener above
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateProfile = async (authUser: SupabaseUser, role: UserRole) => {
    try {
      console.log('Creating/updating profile for user:', authUser.id);
      
      const profileData = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        role: role
      };

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) {
        console.log('Profile upsert error (non-blocking):', error);
      } else {
        console.log('Profile created/updated successfully');
      }
    } catch (error) {
      console.log('Profile operation error (non-blocking):', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    console.log('Attempting login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error('שגיאה בהתחברות. אנא בדוק את פרטי ההתחברות');
    }
    
    console.log('Login successful');
    // Auth state change will be handled by the listener
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    console.log('Attempting registration for:', email, 'with role:', role);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        }
      },
    });

    if (error) {
      console.error('Registration error:', error);
      if (error.message.includes('already_registered') || error.message.includes('already registered')) {
        throw new Error('המשתמש כבר רשום במערכת');
      }
      throw new Error('שגיאה בהרשמה. אנא נסה שוב');
    }

    console.log('Registration successful');
    // Auth state change will be handled by the listener
  };
  
  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const logout = async () => {
    console.log('Logging out');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    session,
    login,
    register,
    logout,
    resetPassword,
    loading
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
