
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
  User,
  Image, 
  Star, 
  PlusCircle,
  Trash,
  Save,
  Upload,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserPageManagement = () => {
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
              <h1 className="text-3xl font-bold">עיצוב דף למשתמש</h1>
              <p className="text-gray-600 mt-1">ניהול פרטי מטפלים, גלריה וחוות דעת</p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link to="/dashboard">
                <Button variant="outline">חזרה ללוח הבקרה</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="therapists" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="therapists">מטפלים</TabsTrigger>
                  <TabsTrigger value="gallery">גלריה</TabsTrigger>
                  <TabsTrigger value="reviews">חוות דעת</TabsTrigger>
                </TabsList>
                
                {/* Therapists Tab */}
                <TabsContent value="therapists" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">ניהול מטפלים</h3>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                        <PlusCircle className="h-4 w-4 ml-1" /> הוסף מטפל
                      </Button>
                      <Button
                        onClick={handleSaveChanges}
                        variant="outline"
                      >
                        <Save className="h-4 w-4 ml-1" /> שמור שינויים
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Therapist 1 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 mb-4 md:mb-0 flex justify-center">
                            <div className="relative w-32 h-32">
                              <div className="bg-gray-200 rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                                <User className="h-16 w-16 text-gray-400" />
                              </div>
                              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                                <Upload className="h-4 w-4 text-freezefit-300" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="md:w-3/4 md:pr-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">שם המטפל</label>
                                <Input defaultValue="דני כהן" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד/התמחות</label>
                                <Input defaultValue="מומחה לטיפול בספורטאי עילית" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">שנות ניסיון</label>
                                <Input defaultValue="5" type="number" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון (אופציונלי)</label>
                                <Input defaultValue="050-1234567" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">פרטים נוספים והתמחויות</label>
                                <Textarea 
                                  defaultValue="דני הוא מטפל מוסמך עם ניסיון של 5 שנים בטיפולי אמבטיות קרח. מתמחה בעבודה עם ספורטאים מקצועיים, בעל תואר ראשון בפיזיותרפיה והסמכה בטיפולי קריותרפיה מתקדמים." 
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button variant="destructive" size="sm">
                                <Trash className="h-4 w-4 ml-1" /> הסר מטפל
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Therapist 2 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 mb-4 md:mb-0 flex justify-center">
                            <div className="relative w-32 h-32">
                              <div className="bg-gray-200 rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                                <User className="h-16 w-16 text-gray-400" />
                              </div>
                              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                                <Upload className="h-4 w-4 text-freezefit-300" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="md:w-3/4 md:pr-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">שם המטפל</label>
                                <Input defaultValue="מיכל לוי" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד/התמחות</label>
                                <Input defaultValue="מומחית לשיקום ופיזיותרפיה" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">שנות ניסיון</label>
                                <Input defaultValue="8" type="number" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון (אופציונלי)</label>
                                <Input defaultValue="052-7654321" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">פרטים נוספים והתמחויות</label>
                                <Textarea 
                                  defaultValue="מיכל היא פיזיותרפיסטית מוסמכת עם 8 שנות ניסיון בעבודה עם מגוון מטופלים, מספורטאים ועד לאנשים הזקוקים לשיקום. בעלת תארים מתקדמים בפיזיותרפיה וטיפולי קור, והתמחות מיוחדת בטיפול בפציעות ספורט." 
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button variant="destructive" size="sm">
                                <Trash className="h-4 w-4 ml-1" /> הסר מטפל
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add New Therapist */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-6">
                      <h4 className="text-lg font-medium mb-6 text-center">הוספת מטפל חדש</h4>
                      
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 mb-4 md:mb-0 flex justify-center">
                          <div className="relative w-32 h-32">
                            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                              <Upload className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-3/4 md:pr-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">שם המטפל</label>
                              <Input placeholder="שם מלא" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד/התמחות</label>
                              <Input placeholder="תחום התמחות עיקרי" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">שנות ניסיון</label>
                              <Input type="number" placeholder="שנות ניסיון" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון (אופציונלי)</label>
                              <Input placeholder="מספר טלפון" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">פרטים נוספים והתמחויות</label>
                              <Textarea placeholder="הכנס פרטים נוספים והתמחויות של המטפל" rows={3} />
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                              <PlusCircle className="h-4 w-4 ml-1" /> הוסף מטפל
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Gallery Tab */}
                <TabsContent value="gallery" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">גלריית תמונות</h3>
                    <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                      <Upload className="h-4 w-4 ml-1" /> העלה תמונות חדשות
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Gallery Item 1 */}
                    <div className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <button className="p-1 bg-white rounded-full">
                            <Edit className="h-4 w-4 text-freezefit-300" />
                          </button>
                          <button className="p-1 bg-white rounded-full">
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gallery Item 2 */}
                    <div className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <button className="p-1 bg-white rounded-full">
                            <Edit className="h-4 w-4 text-freezefit-300" />
                          </button>
                          <button className="p-1 bg-white rounded-full">
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gallery Item 3 */}
                    <div className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <button className="p-1 bg-white rounded-full">
                            <Edit className="h-4 w-4 text-freezefit-300" />
                          </button>
                          <button className="p-1 bg-white rounded-full">
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gallery Item 4 */}
                    <div className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <button className="p-1 bg-white rounded-full">
                            <Edit className="h-4 w-4 text-freezefit-300" />
                          </button>
                          <button className="p-1 bg-white rounded-full">
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add New Gallery Item */}
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">העלה תמונה</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-3">הגדרות גלריה</h4>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת הגלריה (נראית למשתמשים)</label>
                            <Input defaultValue="הצצה למכון שלנו" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור הגלריה</label>
                            <Textarea 
                              defaultValue="תמונות ממכון הטיפולים שלנו, כולל אמבטיות הקרח, אזורי ההמתנה והטיפול"
                              rows={2}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={handleSaveChanges}
                            className="bg-freezefit-300 hover:bg-freezefit-400 text-white"
                          >
                            <Save className="h-4 w-4 ml-1" /> שמור שינויים
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">חוות דעת</h3>
                    <Button onClick={handleSaveChanges} className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                      <Save className="h-4 w-4 ml-1" /> שמור שינויים
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Review 1 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-semibold">יובל אדרי</h4>
                            <div className="flex items-center mr-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">15/04/2025</p>
                        </div>
                        
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="approved-1"
                              defaultChecked={true}
                              className="w-4 h-4 text-freezefit-300 border-gray-300 rounded"
                            />
                            <label htmlFor="approved-1" className="mr-1 text-sm text-gray-700">
                              מאושר
                            </label>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <Textarea 
                        className="mt-3"
                        defaultValue="מכון מעולה! הטיפול עזר לי מאוד להחלמה אחרי פציעת ספורט. המטפלים מקצועיים והאווירה נעימה. אני ממליץ בחום על הטיפולים כאן, במיוחד למי שמתאמן באופן קבוע."
                        rows={3}
                      />
                    </div>
                    
                    {/* Review 2 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-semibold">מיכל דוידוב</h4>
                            <div className="flex items-center mr-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-gray-300" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">02/05/2025</p>
                        </div>
                        
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="approved-2"
                              defaultChecked={true}
                              className="w-4 h-4 text-freezefit-300 border-gray-300 rounded"
                            />
                            <label htmlFor="approved-2" className="mr-1 text-sm text-gray-700">
                              מאושר
                            </label>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <Textarea 
                        className="mt-3"
                        defaultValue="השירות נהדר ומיכל המטפלת מקצועית ונעימה מאוד! הטיפולים עזרו לי בהתאוששות מהר מהצפוי. המקום נקי ומסודר. ארבעה כוכבים רק בגלל שלפעמים צריך לחכות קצת, אבל שווה את זה."
                        rows={3}
                      />
                    </div>
                    
                    {/* Review 3 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-semibold">אורי לוי</h4>
                            <div className="flex items-center mr-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-yellow-500" />
                              <Star className="h-4 w-4 text-gray-300" />
                              <Star className="h-4 w-4 text-gray-300" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">28/04/2025</p>
                        </div>
                        
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="approved-3"
                              defaultChecked={false}
                              className="w-4 h-4 text-freezefit-300 border-gray-300 rounded"
                            />
                            <label htmlFor="approved-3" className="mr-1 text-sm text-gray-700">
                              מאושר
                            </label>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <Textarea 
                        className="mt-3"
                        defaultValue="הטיפול היה סביר, אבל המחירים גבוהים מדי לדעתי. המטפלים מקצועיים אבל היה צפוף מדי במקום כשהגעתי."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-3">הגדרות חוות דעת</h4>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="auto-approve"
                              defaultChecked={false}
                              className="w-4 h-4 text-freezefit-300 border-gray-300 rounded"
                            />
                            <label htmlFor="auto-approve" className="mr-2 text-gray-700">
                              אישור אוטומטי של חוות דעת חדשות
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="show-rating"
                              defaultChecked={true}
                              className="w-4 h-4 text-freezefit-300 border-gray-300 rounded"
                            />
                            <label htmlFor="show-rating" className="mr-2 text-gray-700">
                              הצג דירוג כוכבים ממוצע בדף המכון
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">מספר חוות דעת מקסימלי להצגה</label>
                            <Input type="number" defaultValue="10" className="max-w-[100px]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

export default UserPageManagement;
