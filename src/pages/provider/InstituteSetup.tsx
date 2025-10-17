import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dbOperations } from '@/lib/database';
import { Building2, MapPin, Phone, Mail, AlertTriangle } from 'lucide-react';

const InstituteSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    institute_name: '',
    address: '',
    service_name: '',
    phone: '',
    email: user?.email || '',
    description: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור מכון ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    if (!formData.institute_name || !formData.address) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שם המכון והכתובת",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create institute
      const institute = await dbOperations.createInstitute({
        owner_id: user.id,
        institute_name: formData.institute_name,
        address: formData.address,
        service_name: formData.service_name || 'טיפולי קור',
        image_url: '/placeholder.svg'
      });

      toast({
        title: "מכון נוצר בהצלחה",
        description: `המכון "${formData.institute_name}" נוצר בהצלחה`,
      });

      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating institute:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את המכון, נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 mx-auto text-freezefit-300 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              הגדרת המכון שלך
            </h1>
            <p className="text-gray-600">
              בואו נגדיר את המכון שלך כדי שתוכל להתחיל לנהל את העסק
            </p>
          </div>

          {/* Requirements Alert */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3 space-x-reverse">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-right">
                <h3 className="font-bold text-red-800 mb-2">
                  דרישות חובה להפעלת המכון
                </h3>
                <div className="text-red-700 text-sm space-y-1">
                  <p>• עליך להוסיף לפחות <strong>2 שירותים</strong> למחירון</p>
                  <p>• עליך להוסיף לפחות <strong>1 מטפל</strong> לצוות המכון</p>
                  <p>• רק לאחר השלמת דרישות אלה המכון יהיה זמין ללקוחות</p>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">פרטי המכון</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="institute_name">שם המכון *</Label>
                  <Input
                    id="institute_name"
                    value={formData.institute_name}
                    onChange={(e) => handleInputChange('institute_name', e.target.value)}
                    placeholder="לדוגמה: מרכז קריוסטיים תל אביב"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">כתובת המכון *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="רחוב הרצל 123, תל אביב"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="service_name">סוג השירות *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => handleInputChange('service_name', e.target.value)}
                    placeholder="טיפולי קור, קריוסטיים, וכו'"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="03-1234567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">אימייל *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@institute.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">תיאור המכון *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="ספרו על המכון שלכם, השירותים שאתם מציעים..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="bg-freezefit-300 hover:bg-freezefit-400 text-white px-8"
                    disabled={isLoading}
                  >
                    {isLoading ? 'יוצר מכון...' : 'צור מכון'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default InstituteSetup;