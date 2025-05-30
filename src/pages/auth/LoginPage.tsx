
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const redirectTo = location.state?.redirectTo;

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectTo) {
        navigate(redirectTo);
      } else if (user.role === 'provider') {
        navigate('/dashboard');
      } else {
        navigate('/find-institute');
      }
    }
  }, [isAuthenticated, user, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "התחברת בהצלחה",
        description: "ברוכים הבאים למערכת",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message || "אירעה שגיאה בהתחברות",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">התחברות</CardTitle>
            <CardDescription>
              הזן את פרטי ההתחברות שלך להמשך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  אימייל
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="test@example.com"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    סיסמה
                  </label>
                  <Link to="/forgot-password" className="text-sm text-freezefit-300 hover:text-freezefit-400">
                    שכחת סיסמה?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-freezefit-300 hover:bg-freezefit-400 text-black" 
                  disabled={isLoading}
                >
                  {isLoading ? 'מתחבר...' : 'התחבר'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm">
              אין לך חשבון?{' '}
              <Link to="/register" className="text-freezefit-300 hover:text-freezefit-400">
                הרשם עכשיו
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
