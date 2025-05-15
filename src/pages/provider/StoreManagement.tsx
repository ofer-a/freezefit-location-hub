
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Tag, 
  PlusCircle,
  Edit,
  Trash,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StoreManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSaveChanges = () => {
    toast({
      title: "שינויים נשמרו",
      description: "השינויים נשמרו בהצלחה",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">ניהול חנות</h1>
              <p className="text-gray-600 mt-1">ניהול סדנאות, שעות פעילות ומחירון</p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link to="/dashboard">
                <Button variant="outline">חזרה ללוח הבקרה</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="workshops" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="workshops">סדנאות</TabsTrigger>
                  <TabsTrigger value="hours">שעות פתיחה</TabsTrigger>
                  <TabsTrigger value="pricing">מחירון</TabsTrigger>
                </TabsList>
                
                {/* Workshops Management Tab */}
                <TabsContent value="workshops" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">ניהול סדנאות</h3>
                    <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                      <PlusCircle className="h-4 w-4 ml-1" /> הוסף סדנה חדשה
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Workshop 1 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex flex-col lg:flex-row justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">סדנת היכרות עם אמבטיות קרח</h4>
                            <p className="text-gray-600 mt-1">סדנה מקיפה למתחילים בטיפולי אמבטיות קרח</p>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 ml-1 text-gray-500" />
                              <span className="text-sm text-gray-500 ml-4">יום שלישי, 22/05/2025</span>
                              <Clock className="h-4 w-4 ml-1 text-gray-500" />
                              <span className="text-sm text-gray-500">18:00-20:00</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-4 lg:mt-0">
                            <div className="text-sm bg-freezefit-50 text-freezefit-500 px-3 py-1 rounded-full ml-2">
                              <span>₪150 / משתתף</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Workshop 2 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex flex-col lg:flex-row justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">סדנת קריותרפיה מתקדמת לספורטאים</h4>
                            <p className="text-gray-600 mt-1">טכניקות מתקדמות להחלמה מהירה לספורטאים מקצועיים</p>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 ml-1 text-gray-500" />
                              <span className="text-sm text-gray-500 ml-4">יום חמישי, 25/05/2025</span>
                              <Clock className="h-4 w-4 ml-1 text-gray-500" />
                              <span className="text-sm text-gray-500">16:00-19:00</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-4 lg:mt-0">
                            <div className="text-sm bg-freezefit-50 text-freezefit-500 px-3 py-1 rounded-full ml-2">
                              <span>₪220 / משתתף</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add Workshop Form */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">סדנה חדשה</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="workshop-name" className="block text-sm font-medium text-gray-700 mb-1">שם הסדנה</label>
                          <Input id="workshop-name" placeholder="הכנס שם סדנה" />
                        </div>
                        <div>
                          <label htmlFor="workshop-price" className="block text-sm font-medium text-gray-700 mb-1">מחיר למשתתף (₪)</label>
                          <Input id="workshop-price" type="number" placeholder="מחיר" />
                        </div>
                        <div>
                          <label htmlFor="workshop-date" className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
                          <Input id="workshop-date" type="date" />
                        </div>
                        <div>
                          <label htmlFor="workshop-time" className="block text-sm font-medium text-gray-700 mb-1">שעות</label>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Input id="workshop-start-time" type="time" />
                            <span>עד</span>
                            <Input id="workshop-end-time" type="time" />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="workshop-description" className="block text-sm font-medium text-gray-700 mb-1">תיאור הסדנה</label>
                          <Textarea id="workshop-description" placeholder="הכנס תיאור מפורט של הסדנה" rows={3} />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                          <Save className="h-4 w-4 ml-1" /> שמור סדנה
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Operating Hours Tab */}
                <TabsContent value="hours" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">שעות פתיחה</h3>
                    <Button
                      onClick={handleSaveChanges}
                      className="bg-freezefit-300 hover:bg-freezefit-400 text-white"
                    >
                      <Save className="h-4 w-4 ml-1" /> שמור שינויים
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="font-semibold">שעות רגילות</div>
                          <div className="text-sm text-gray-500">ימים א'-ה'</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>יום ראשון</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="20:00" className="w-24" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>יום שני</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="20:00" className="w-24" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>יום שלישי</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="20:00" className="w-24" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>יום רביעי</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="20:00" className="w-24" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>יום חמישי</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="20:00" className="w-24" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="font-semibold">סופי שבוע</div>
                          <div className="text-sm text-gray-500">ימים ו'-ש'</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>יום שישי</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="14:00" className="w-24" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>יום שבת</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Input type="time" defaultValue="10:00" className="w-24" />
                              <span>-</span>
                              <Input type="time" defaultValue="16:00" className="w-24" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="font-semibold mb-4">הערות מיוחדות לגבי שעות הפעילות</div>
                        <Textarea 
                          placeholder="הוסף הערות מיוחדות כגון שעות סגירה בחגים או ימים מיוחדים"
                          defaultValue="המכון סגור בכל החגים. בערבי חג המכון נסגר בשעה 14:00."
                          rows={3}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Pricing Tab */}
                <TabsContent value="pricing" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">מחירון טיפולים</h3>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                        <PlusCircle className="h-4 w-4 ml-1" /> הוסף מחיר חדש
                      </Button>
                      <Button
                        onClick={handleSaveChanges}
                        variant="outline"
                      >
                        <Save className="h-4 w-4 ml-1" /> שמור שינויים
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Price Item 1 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="mr-2">
                              <Input defaultValue="טיפול סטנדרטי" className="font-medium" />
                            </div>
                            <Tag className="h-4 w-4 text-freezefit-300" />
                          </div>
                          <Input 
                            defaultValue="טיפול באמבטיית קרח בסיסי כולל הדרכה אישית" 
                            className="text-gray-600 mt-1"
                          />
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 ml-1 text-gray-500" />
                            <Input defaultValue="45" type="number" className="w-16 text-sm text-gray-500" />
                            <span className="text-sm text-gray-500 mr-1">דקות</span>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <div className="flex items-center mr-4">
                            <span className="text-lg font-medium mr-1">₪</span>
                            <Input defaultValue="120" type="number" className="w-20" />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Item 2 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="mr-2">
                              <Input defaultValue="טיפול ספורטאים" className="font-medium" />
                            </div>
                            <Tag className="h-4 w-4 text-freezefit-300" />
                          </div>
                          <Input 
                            defaultValue="טיפול מקצועי לספורטאים כולל עיסוי שחרור שרירים" 
                            className="text-gray-600 mt-1"
                          />
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 ml-1 text-gray-500" />
                            <Input defaultValue="60" type="number" className="w-16 text-sm text-gray-500" />
                            <span className="text-sm text-gray-500 mr-1">דקות</span>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <div className="flex items-center mr-4">
                            <span className="text-lg font-medium mr-1">₪</span>
                            <Input defaultValue="180" type="number" className="w-20" />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Item 3 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="mr-2">
                              <Input defaultValue="חבילת 5 טיפולים" className="font-medium" />
                            </div>
                            <Tag className="h-4 w-4 text-freezefit-300" />
                          </div>
                          <Input 
                            defaultValue="חבילת טיפולים משתלמת, תקפה לחצי שנה" 
                            className="text-gray-600 mt-1"
                          />
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 ml-1 text-gray-500" />
                            <Input defaultValue="45" type="number" className="w-16 text-sm text-gray-500" />
                            <span className="text-sm text-gray-500 mr-1">דקות לטיפול</span>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <div className="flex items-center mr-4">
                            <span className="text-lg font-medium mr-1">₪</span>
                            <Input defaultValue="500" type="number" className="w-20" />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add New Price Form */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-6">
                      <h4 className="text-lg font-medium mb-4">הוסף שירות חדש</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 mb-1">שם השירות</label>
                          <Input id="service-name" placeholder="הכנס שם שירות" />
                        </div>
                        <div>
                          <label htmlFor="service-price" className="block text-sm font-medium text-gray-700 mb-1">מחיר (₪)</label>
                          <Input id="service-price" type="number" placeholder="מחיר" />
                        </div>
                        <div>
                          <label htmlFor="service-duration" className="block text-sm font-medium text-gray-700 mb-1">משך זמן (דקות)</label>
                          <Input id="service-duration" type="number" placeholder="משך זמן" />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="service-description" className="block text-sm font-medium text-gray-700 mb-1">תיאור השירות</label>
                          <Textarea id="service-description" placeholder="הכנס תיאור מפורט של השירות" rows={2} />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                          הוסף שירות
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StoreManagement;
