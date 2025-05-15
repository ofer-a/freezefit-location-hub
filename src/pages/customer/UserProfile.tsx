
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Calendar, Star, Gift } from 'lucide-react';

const UserProfile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Mock data
  const loyaltyPoints = 320;
  const upcomingAppointments = [
    { id: 1, date: '15/05/2025', time: '16:00', institute: 'מרכז קריוסטיים', therapist: 'דני כהן' },
    { id: 2, date: '21/05/2025', time: '10:00', institute: 'אייס פיט', therapist: 'אלון ברק' }
  ];
  const pastAppointments = [
    { id: 3, date: '01/05/2025', time: '12:30', institute: 'קריו פלוס', therapist: 'רונית דוד' },
    { id: 4, date: '27/04/2025', time: '17:00', institute: 'מרכז קריוסטיים', therapist: 'דני כהן' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-8 text-center">הפרופיל שלי</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>פרטים אישיים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-freezefit-50 rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-freezefit-300" />
                  </div>
                  <h3 className="text-xl font-medium">{user?.name}</h3>
                  <p className="text-gray-500 mb-6">{user?.email}</p>
                  
                  <div className="w-full py-4 px-6 bg-freezefit-50 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">נקודות נאמנות:</span>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-freezefit-300 ml-1" />
                        <span className="text-lg font-bold">{loyaltyPoints}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mb-2">
                    עדכן פרטים
                  </Button>
                  <Button variant="outline" className="w-full">
                    שנה סיסמה
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Appointments */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>התורים שלי</CardTitle>
                <CardDescription>
                  צפייה וניהול התורים שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">תורים עתידיים</TabsTrigger>
                    <TabsTrigger value="past">היסטוריית תורים</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="mt-6">
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map(appointment => (
                          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{appointment.institute}</h4>
                                <p className="text-sm text-gray-600">מטפל: {appointment.therapist}</p>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-freezefit-300 ml-1" />
                                <div>
                                  <p className="text-sm font-medium">{appointment.date}</p>
                                  <p className="text-sm text-gray-500">שעה: {appointment.time}</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end space-x-2 rtl:space-x-reverse">
                              <Button variant="outline" size="sm">
                                שנה תור
                              </Button>
                              <Button variant="destructive" size="sm">
                                בטל תור
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p>אין לך תורים עתידיים</p>
                        <Button className="mt-4 bg-freezefit-300 hover:bg-freezefit-400 text-white" onClick={() => navigate('/find-institute')}>
                          הזמן תור חדש
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past" className="mt-6">
                    {pastAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {pastAppointments.map(appointment => (
                          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{appointment.institute}</h4>
                                <p className="text-sm text-gray-600">מטפל: {appointment.therapist}</p>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-gray-400 ml-1" />
                                <div>
                                  <p className="text-sm font-medium">{appointment.date}</p>
                                  <p className="text-sm text-gray-500">שעה: {appointment.time}</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button variant="outline" size="sm">
                                הוסף ביקורת
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p>אין לך היסטוריית תורים</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Loyalty program */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>מועדון לקוחות</CardTitle>
                <CardDescription>
                  ההטבות והמבצעים שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-freezefit-300 to-freezefit-400 text-white rounded-lg p-5 flex flex-col justify-between">
                    <div>
                      <Gift className="h-8 w-8 mb-3" />
                      <h3 className="text-lg font-bold mb-1">הטבת יום הולדת</h3>
                      <p className="text-sm opacity-90">טיפול חינם ביום ההולדת שלך!</p>
                    </div>
                    <div className="mt-4 text-xs opacity-75">
                      בתוקף עד 30 ימים מיום ההולדת
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-freezefit-50 to-purple-100 rounded-lg p-5 flex flex-col justify-between">
                    <div>
                      <Star className="h-8 w-8 mb-3 text-freezefit-300" />
                      <h3 className="text-lg font-bold mb-1">הנחת לקוח מתמיד</h3>
                      <p className="text-sm text-gray-600">15% הנחה אחרי 5 טיפולים</p>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      2 טיפולים נוספים להטבה
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-5 flex flex-col justify-between">
                    <div>
                      <Calendar className="h-8 w-8 mb-3 text-freezefit-300" />
                      <h3 className="text-lg font-bold mb-1">מבצע החודש</h3>
                      <p className="text-sm text-gray-600">קנה 4 טיפולים, קבל 1 חינם</p>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      בתוקף עד 31/05/2025
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
