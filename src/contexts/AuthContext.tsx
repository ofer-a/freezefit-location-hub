
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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'לקוח לדוגמה', email: 'customer@example.com', role: 'customer' },
  { id: '2', name: 'ספק שירות לדוגמה', email: 'provider@example.com', role: 'provider' }
];

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Check local storage for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('freezefit_user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('freezefit_user');
      }
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (foundUser && password === '123456') {
          setUser(foundUser);
          setIsAuthenticated(true);
          localStorage.setItem('freezefit_user', JSON.stringify(foundUser));
          resolve();
        } else {
          reject(new Error('אימייל או סיסמה לא נכונים'));
        }
      }, 500);
    });
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          reject(new Error('משתמש עם אימייל זה כבר קיים במערכת'));
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: `${mockUsers.length + 1}`,
          name,
          email,
          role
        };
        
        // In a real app we would save to database here
        mockUsers.push(newUser);
        
        // Log in the new user
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('freezefit_user', JSON.stringify(newUser));
        resolve();
      }, 500);
    });
  };
  
  // Reset password function
  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!foundUser) {
          reject(new Error('לא נמצא משתמש עם האימייל הזה'));
          return;
        }
        
        // In a real app, we would update the password in the database
        // For our mock system, we'll just resolve the promise as if the password was updated
        resolve();
      }, 500);
    });
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('freezefit_user');
  };

  // Create value object
  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    resetPassword
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
