
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, Star, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleFindInstitute = () => {
    if (isAuthenticated) {
      navigate('/find-institute');
    } else {
      navigate('/login', { state: { redirectTo: '/find-institute' } });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would submit this to your backend
    toast({
      title: "נרשמת בהצלחה!",
      description: "תודה על הרשמתך לעדכונים",
    });
    setEmail('');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would submit this to your backend
    toast({
      title: "ההודעה נשלחה בהצלחה",
      description: "ניצור איתך קשר בהקדם",
    });
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              ברוכים הבאים ל-Freezefit
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
              הפלטפורמה המובילה לניהול וחיפוש מרכזי טיפול באמבטיות קרח
            </p>
            <Button 
              onClick={handleFindInstitute}
              className="bg-freezefit-300 hover:bg-freezefit-400 text-white text-lg py-6 px-8 rounded-md animate-fade-in flex items-center mx-auto"
            >
              מצא מכון
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="about">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">יתרונות המערכת</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-freezefit-50 rounded-full">
                <MapPin className="h-8 w-8 text-freezefit-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">מציאת מכון קרוב</h3>
              <p className="text-gray-600">איתור מרכזי טיפול ברדיוס של 7 ק"מ מהמיקום שלך</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-freezefit-50 rounded-full">
                <Calendar className="h-8 w-8 text-freezefit-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">הזמנת תורים</h3>
              <p className="text-gray-600">הזמן תור בקלות ובמהירות למכון הקרוב אליך</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-freezefit-50 rounded-full">
                <Star className="h-8 w-8 text-freezefit-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">מועדון לקוחות</h3>
              <p className="text-gray-600">צבירת נקודות, מתנות, הנחות ועדכונים שוטפים</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-freezefit-50 rounded-full">
                <Users className="h-8 w-8 text-freezefit-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ניהול מתקדם</h3>
              <p className="text-gray-600">מערכת ניהול מתקדמת עבור בעלי מרכזי טיפול</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-freezefit-50" id="newsletter">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">הרשמה לעדכונים</h2>
            <p className="text-gray-600 mb-8">הירשמו לקבלת עדכונים שוטפים, מבצעים מיוחדים ותכנים בלעדיים</p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="הכנס את כתובת האימייל שלך"
                className="flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                הירשם
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16" id="contact">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">צור קשר</h2>
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                  <Input id="name" type="text" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                  <Input id="email" type="email" required />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">נושא</label>
                <Input id="subject" type="text" required />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">הודעה</label>
                <Textarea id="message" rows={5} required />
              </div>
              
              <div className="text-center">
                <Button type="submit" className="bg-freezefit-300 hover:bg-freezefit-400 text-white px-8">
                  שלח הודעה
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
