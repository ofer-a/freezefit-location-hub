
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LocationState {
  redirectTo?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const state = location.state as LocationState | null;
  const redirectTo = state?.redirectTo || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "התחברת בהצלחה",
        description: "ברוכים הבאים ל-Freezefit",
      });
      navigate(redirectTo);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: "אימייל או סיסמה לא נכונים",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא הזן כתובת אימייל",
      });
      return;
    }
    
    // In a real app, this would call an API to send the reset code
    toast({
      title: "קוד איפוס נשלח",
      description: "בדוק את תיבת האימייל שלך לקבלת קוד איפוס הסיסמה",
    });
    
    // Close the forgot password dialog and open the password reset dialog
    setShowForgotPasswordDialog(false);
    setShowPasswordResetDialog(true);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetCode || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הסיסמאות אינן תואמות",
      });
      return;
    }
    
    // In a real app, this would call an API to verify the code and reset the password
    toast({
      title: "הסיסמה שונתה בהצלחה",
      description: "כעת תוכל להתחבר עם הסיסמה החדשה שלך",
    });
    
    // Close the dialog and reset states
    setShowPasswordResetDialog(false);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">התחברות</CardTitle>
            <CardDescription>
              התחבר כדי לגשת לחשבונך
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
                  placeholder="אימייל שלך"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    סיסמה
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPasswordDialog(true)}
                    className="text-sm text-freezefit-300 hover:text-freezefit-400"
                  >
                    שכחת סיסמה?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="הסיסמה שלך"
                />
              </div>
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-freezefit-300 hover:bg-freezefit-400 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? 'מתחבר...' : 'התחבר'}
                </Button>
              </div>
              
              <div className="text-center text-sm">
                <span className="text-gray-500">לצורך הדגמה, </span>
                <span>השתמש ב- user@example.com (לקוח) או provider@example.com (ספק)</span>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm">
              אין לך חשבון?{' '}
              <Link to="/register" className="text-freezefit-300 hover:text-freezefit-400">
                הירשם עכשיו
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>איפוס סיסמה</DialogTitle>
            <DialogDescription>
              הזן את כתובת האימייל שלך ואנו נשלח לך קוד לאיפוס הסיסמה
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="forgotPasswordEmail" className="text-sm font-medium">
                אימייל
              </label>
              <Input
                id="forgotPasswordEmail"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="הזן את האימייל שלך"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForgotPasswordDialog(false)}>
                ביטול
              </Button>
              <Button type="submit">
                שלח קוד איפוס
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Password Reset Dialog */}
      <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הגדרת סיסמה חדשה</DialogTitle>
            <DialogDescription>
              הזן את קוד האיפוס שנשלח לאימייל שלך והגדר סיסמה חדשה
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="resetCode" className="text-sm font-medium">
                קוד איפוס
              </label>
              <Input
                id="resetCode"
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="הזן את קוד האיפוס"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                סיסמה חדשה
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הזן סיסמה חדשה"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                אימות סיסמה
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן שוב את הסיסמה החדשה"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPasswordResetDialog(false)}>
                ביטול
              </Button>
              <Button type="submit">
                שמור סיסמה חדשה
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
