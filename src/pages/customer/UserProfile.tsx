
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Calendar, Clock, Edit, RefreshCw, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppointmentChangeDialog from '@/components/provider/AppointmentChangeDialog';
import EditProfileDialog from '@/components/customer/EditProfileDialog';
import ChangePasswordDialog from '@/components/customer/ChangePasswordDialog';

const UserProfile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    confirmedAppointments, 
    historyAppointments,
    requestAppointmentChange
  } = useData();
  
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Filter appointments for current user (in a real app, this would be based on actual user ID)
  const userConfirmedAppointments = confirmedAppointments.filter(apt => 
    user?.name === 'לקוח לדוגמה' // Mock filter - in real app would use user.id
  );

  const userHistoryAppointments = historyAppointments.filter(apt => 
    user?.name === 'לקוח לדוגמה' // Mock filter - in real app would use user.id
  );

  const handleChangeAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsChangeDialogOpen(true);
  };

  const handleConfirmChange = (newDate: Date, newTime: string) => {
    if (selectedAppointment) {
      requestAppointmentChange(selectedAppointment.id, newDate, newTime);
      
      toast({
        title: "בקשת שינוי נשלחה",
        description: "הבקשה נשלחה לספק השירות לאישור",
      });
      
      setSelectedAppointment(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">פרופיל משתמש</h1>
            <p className="text-gray-600 mt-1">ברוך הבא, {user.name}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>פרטים אישיים</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">שם מלא</label>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">אימייל</label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">סוג משתמש</label>
                      <p className="font-medium">{user.role === 'customer' ? 'לקוח' : 'ספק שירות'}</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsEditProfileOpen(true)}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        עדכן פרטים
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsChangePasswordOpen(true)}
                      >
                        <Lock className="h-4 w-4 ml-1" />
                        שנה סיסמה
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>התורים שלי</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upcoming">תורים קרובים</TabsTrigger>
                      <TabsTrigger value="history">היסטוריה</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming" className="mt-6">
                      <div className="space-y-4">
                        {userConfirmedAppointments.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">אין תורים קרובים</p>
                          </div>
                        ) : (
                          userConfirmedAppointments.map(appointment => (
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-lg">מטפל: {appointment.therapistName}</h3>
                                  <p className="text-gray-600">שירות: {appointment.serviceName}</p>
                                  <p className="text-gray-600">{appointment.duration}</p>
                                  <div className="flex items-center mt-2 text-gray-700">
                                    <Calendar className="h-4 w-4 ml-1" />
                                    <span className="ml-4">{appointment.date}</span>
                                    <Clock className="h-4 w-4 ml-1" />
                                    <span>{appointment.time}</span>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleChangeAppointment(appointment)}
                                >
                                  <RefreshCw className="h-4 w-4 ml-1" />
                                  שנה תור
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="history" className="mt-6">
                      <div className="space-y-4">
                        {userHistoryAppointments.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">אין היסטוריית תורים</p>
                          </div>
                        ) : (
                          userHistoryAppointments.map(appointment => (
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-lg">מטפל: {appointment.therapistName}</h3>
                                  <p className="text-gray-600">שירות: {appointment.serviceName}</p>
                                  <p className="text-gray-600">{appointment.duration}</p>
                                  <div className="flex items-center mt-2 text-gray-700">
                                    <Calendar className="h-4 w-4 ml-1" />
                                    <span className="ml-4">{appointment.date}</span>
                                    <Clock className="h-4 w-4 ml-1" />
                                    <span>{appointment.time}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-1 rounded text-sm ${
                                    appointment.status === 'הושלם' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {appointment.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Change Appointment Dialog */}
      <AppointmentChangeDialog
        isOpen={isChangeDialogOpen}
        onClose={() => setIsChangeDialogOpen(false)}
        onConfirm={handleConfirmChange}
        currentDate={selectedAppointment?.date || ''}
        currentTime={selectedAppointment?.time || ''}
      />

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
      
      <Footer />
    </div>
  );
};

export default UserProfile;
