
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendPasswordResetCode } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Send alternative password
      const code = await sendPasswordResetCode(email);
      
      toast({
        title: "סיסמה חלופית נשלחה",
        description: "בדוק את תיבת האימייל שלך לקבלת הסיסמה החלופית",
      });
      
      // For demo purposes, we're passing the code in the state
      // In a real app, this would be sent via email
      navigate('/reset-password', { 
        state: { 
          email
        } 
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה",
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
            <CardTitle className="text-2xl">שחזור סיסמה</CardTitle>
            <CardDescription>
              הזן את כתובת האימייל שלך ואנו נשלח לך סיסמה חלופית
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
                  placeholder="הזן את האימייל שלך"
                  className="w-full"
                />
              </div>
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-freezefit-300 hover:bg-freezefit-400 text-black" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      שולח...
                    </>
                  ) : 'שלח סיסמה חלופית'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm">
              <Link to="/login" className="text-freezefit-300 hover:text-freezefit-400">
                חזרה להתחברות
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
