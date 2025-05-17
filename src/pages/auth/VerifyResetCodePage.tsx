
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface LocationState {
  email: string;
  code?: string; // Only for demo purposes
}

const VerifyResetCodePage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyResetCode } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Type guard for location state
  const state = location.state as LocationState | undefined;
  
  useEffect(() => {
    // If no email in state, redirect to forgot password page
    if (!state?.email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [state, navigate]);
  
  if (!state?.email) {
    return null; // Redirect will happen via useEffect
  }
  
  const { email, code } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const isValid = await verifyResetCode(email, verificationCode);
      
      if (isValid) {
        toast({
          title: "קוד אומת בהצלחה",
          description: "כעת תוכל להגדיר סיסמה חדשה",
        });
        navigate('/reset-password', { state: { email } });
      } else {
        toast({
          variant: "destructive",
          title: "קוד שגוי",
          description: "הקוד שהזנת אינו תקין. נסה שנית.",
        });
      }
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

  // Handle resend code
  const handleResendCode = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">אימות קוד</CardTitle>
            <CardDescription>
              הזן את קוד האימות בן 6 הספרות שנשלח לאימייל {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label htmlFor="verification-code" className="block text-sm font-medium text-center">
                  קוד אימות
                </label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    render={({ slots }) => (
                      <InputOTPGroup>
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} index={index} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                
                {/* For demo purposes only - display code for testing */}
                {code && (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    <p>לצורך הדגמה בלבד:</p>
                    <p>הקוד לאימייל {email} הוא: <strong>{code}</strong></p>
                  </div>
                )}
              </div>
              
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-freezefit-300 hover:bg-freezefit-400 text-black" 
                  disabled={isLoading || verificationCode.length < 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      מאמת...
                    </>
                  ) : 'אמת קוד'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col justify-center space-y-2">
            <div className="text-sm">
              <Button 
                variant="link" 
                className="text-freezefit-300 hover:text-freezefit-400 p-0"
                onClick={handleResendCode}
              >
                שלח קוד חדש
              </Button>
            </div>
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

export default VerifyResetCodePage;
