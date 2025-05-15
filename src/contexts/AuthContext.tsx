
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user types
export type UserRole = 'customer' | 'provider' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('freezefit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login functionality (replace with real auth later)
  const login = async (email: string, password: string) => {
    // This is a mock implementation, replace with actual API call
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock response based on email for demo purposes
      const isProvider = email.includes('provider');
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: isProvider ? 'מנהל מרכז' : 'לקוח',
        email,
        role: isProvider ? 'provider' : 'customer',
      };
      
      setUser(mockUser);
      localStorage.setItem('freezefit_user', JSON.stringify(mockUser));
      return mockUser;
    } catch (error) {
      throw new Error('שגיאה בהתחברות');
    }
  };

  // Mock register functionality
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // This is a mock implementation, replace with actual API call
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        role,
      };
      
      setUser(mockUser);
      localStorage.setItem('freezefit_user', JSON.stringify(mockUser));
      return mockUser;
    } catch (error) {
      throw new Error('שגיאה בהרשמה');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freezefit_user');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">טוען...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
