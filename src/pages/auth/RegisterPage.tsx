
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { UserRole } from '@/contexts/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'provider') {
        navigate('/dashboard');
      } else {
        navigate('/find-institute');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(name, email, password, role);
      toast({
        title: "נרשמת בהצלחה",
        description: "ברוכים הבאים ל-Freezefit",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "לא ניתן להשלים את ההרשמה, נסה שוב";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "המשתמש כבר רשום במערכת. נסה להתחבר במקום זאת";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "כתובת האימייל אינה תקינה";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים";
      }
      
      toast({
        variant: "destructive",
        title: "שגיאה בהרשמה",
        description: errorMessage,
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
            <CardTitle className="text-2xl">הרשמה</CardTitle>
            <CardDescription>
              צור חשבון חדש ב-Freezefit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  שם מלא
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="השם המלא שלך"
                />
              </div>
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
                  placeholder="האימייל שלך"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  סיסמה
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="בחר סיסמה"
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  סוג משתמש
                </label>
                <RadioGroup
                  value={role || 'customer'}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">לקוח - אני מחפש מרכזי טיפול</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="provider" id="provider" />
                    <Label htmlFor="provider">ספק - אני מנהל מרכז טיפול</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-freezefit-300 hover:bg-freezefit-400 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? 'יוצר חשבון...' : 'הירשם'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm">
              כבר יש לך חשבון?{' '}
              <Link to="/login" className="text-freezefit-300 hover:text-freezefit-400">
                התחבר
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
