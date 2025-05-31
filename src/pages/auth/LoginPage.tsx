
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || '/';
  const redirectTo = location.state?.redirectTo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      
      toast({
        title: "התחברת בהצלחה",
        description: "ברוך הבא למערכת",
      });

      // Check user role and redirect accordingly
      const storedUser = localStorage.getItem('freezefit_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'provider') {
          navigate('/dashboard');
        } else {
          navigate(redirectTo || from);
        }
      } else {
        navigate(redirectTo || from);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">התחברות</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  אימייל
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="הכנס את האימייל שלך"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  סיסמה
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="הכנס את הסיסמה שלך"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-freezefit-300 hover:bg-freezefit-400 text-black"
                disabled={isLoading}
              >
                {isLoading ? 'מתחבר...' : 'התחבר'}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm">
                עדיין אין לך חשבון?{' '}
                <Link to="/register" className="text-freezefit-300 hover:text-freezefit-400 font-medium">
                  הירשם כאן
                </Link>
              </p>
              <Link 
                to="/forgot-password" 
                className="text-sm text-gray-600 hover:text-freezefit-300 block"
              >
                שכחת סיסמה?
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600 mb-2">חשבונות לדוגמה:</p>
              <div className="space-y-1 text-xs">
                <p><strong>לקוח:</strong> customer@example.com</p>
                <p><strong>ספק שירות:</strong> provider@example.com</p>
                <p><strong>סיסמה:</strong> 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
