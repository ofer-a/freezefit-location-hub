
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'customer' | 'provider';

// Define user type
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

// Define context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error getting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      const userData: User = {
        id: authUser.id,
        name: profile.full_name || authUser.email?.split('@')[0] || '',
        email: authUser.email || '',
        role: profile.role || 'customer',
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        address: profile.address,
        image_url: profile.image_url
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      await fetchUserProfile(data.user);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await fetchUserProfile(data.user);
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Create value object
  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    resetPassword,
    loading
  };

  // Provide context
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
