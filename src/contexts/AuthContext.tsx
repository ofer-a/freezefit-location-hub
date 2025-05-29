
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
        console.log('Auth state change:', event, session?.user?.id);
        
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
      console.log('Fetching profile for user:', authUser.id);
      
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!profile && !error) {
        console.log('Profile not found, creating new profile');
        const newProfile = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
          role: (authUser.user_metadata?.role as UserRole) || 'customer'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Continue with basic user data even if profile creation fails
        } else {
          profile = createdProfile;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // Continue with basic user data
      }

      // Create user data object
      const userData: User = {
        id: authUser.id,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: profile?.role || (authUser.user_metadata?.role as UserRole) || 'customer',
        full_name: profile?.full_name || authUser.user_metadata?.full_name,
        age: profile?.age,
        gender: profile?.gender,
        address: profile?.address,
        image_url: profile?.image_url
      };

      console.log('User profile loaded:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create basic user object even if profile operations fail
      const userData: User = {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as UserRole) || 'customer'
      };
      
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  // Login function - simplified to work with any email format
  const login = async (email: string, password: string): Promise<void> => {
    console.log('Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('Login successful, fetching profile');
        await fetchUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Register function - simplified to work with any email format
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    console.log('Attempting registration for:', email, 'with role:', role);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
          // Skip email confirmation for development
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Registration successful, fetching profile');
        await fetchUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  // Logout function
  const logout = async () => {
    console.log('Logging out');
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
