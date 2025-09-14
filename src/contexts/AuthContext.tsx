
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export type UserRole = 'customer' | 'provider';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Define context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ redirectTo: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ redirectTo: string }>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL for authentication
const API_BASE_URL = '/.netlify/functions';

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check local storage for existing session on mount
  useEffect(() => {
    const verifyStoredToken = async () => {
      const storedToken = localStorage.getItem('freezefit_token');
      const storedUser = localStorage.getItem('freezefit_user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: storedToken })
          });
          
          const result = await response.json();
          
          if (result.success && result.data.user) {
            setUser(result.data.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('freezefit_token');
            localStorage.removeItem('freezefit_user');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('freezefit_token');
          localStorage.removeItem('freezefit_user');
        }
      }
      
      // Set loading to false after verification attempt (whether token exists or not)
      setIsLoading(false);
    };

    verifyStoredToken();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ redirectTo: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (result.success && result.data.user && result.data.token) {
        const { user, token, redirectTo } = result.data;
        
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('freezefit_user', JSON.stringify(user));
        localStorage.setItem('freezefit_token', token);
        
        return { redirectTo };
      } else {
        throw new Error(result.error || 'אימייל או סיסמה לא נכונים');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('שגיאה בהתחברות, נסה שוב');
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ redirectTo: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const result = await response.json();
      
      if (result.success && result.data.user && result.data.token) {
        const { user, token, redirectTo } = result.data;
        
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('freezefit_user', JSON.stringify(user));
        localStorage.setItem('freezefit_token', token);
        
        return { redirectTo };
      } else {
        throw new Error(result.error || 'שגיאה בהרשמה');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('שגיאה בהרשמה, נסה שוב');
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'שגיאה באיפוס סיסמה');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('שגיאה באיפוס סיסמה, נסה שוב');
    }
  };

  // Change password function (for logged-in users)
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user?.id) {
      throw new Error('משתמש לא מחובר');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          currentPassword, 
          newPassword 
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'שגיאה בשינוי סיסמה');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('שגיאה בשינוי סיסמה, נסה שוב');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('freezefit_user');
    localStorage.removeItem('freezefit_token');
  };

  // Create value object
  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    changePassword
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
