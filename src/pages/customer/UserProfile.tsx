
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, Clock, MessageSquare } from 'lucide-react';

// Mock appointments for the user
const mockUpcomingAppointments = [
  { 
    id: 1, 
    instituteId: 1,
    instituteName: 'מרכז קריוסטיים', 
    therapistId: 1,
    therapistName: 'דני כהן', 
    service: 'טיפול סטנדרטי',
    date: '15/05/2025', 
    time: '10:00' 
  },
  { 
    id: 2, 
    instituteId: 2,
    instituteName: 'קריו פלוס', 
    therapistId: 3,
    therapistName: 'רונית דוד', 
    service: 'טיפול ספורטאים',
    date: '20/05/2025', 
    time: '15:30' 
  }
];

const mockPastAppointments = [
  { 
    id: 3, 
    instituteId: 3,
    instituteName: 'אייס פיט', 
    therapistId: 4,
    therapistName: 'אלון ברק', 
    service: 'טיפול קצר',
    date: '05/05/2025', 
    time: '11:00',
    status: 'הושלם'
  },
  { 
    id: 4, 
    instituteId: 1,
    instituteName: 'מרכז קריוסטיים', 
    therapistId: 2,
    therapistName: 'מיכל לוי', 
    service: 'טיפול שיקום',
    date: '01/05/2025', 
    time: '16:45',
    status: 'בוטל'
  }
];

const UserProfile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [upcomingAppointments, setUpcomingAppointments] = useState(mockUpcomingAppointments);
  const [pastAppointments, setPastAppointments] = useState(mockPastAppointments);
  
  // Dialog states
  const [showUpdateDetailsDialog, setShowUpdateDetailsDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  
  // Form states
  const [userDetails, setUserDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '050-1234567', // Mock data
    address: 'רחוב האלון 5, תל אביב' // Mock data
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check authentication
  useState(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  });

  // Handle appointment cancellation
  const handleCancelAppointment = (appointmentId: number) => {
    // Move to past appointments with "cancelled" status
    const appointmentToCancel = upcomingAppointments.find(app => app.id === appointmentId);
    
    if (appointmentToCancel) {
      setPastAppointments([
        ...pastAppointments, 
        { ...appointmentToCancel, status: 'בוטל' }
      ]);
      
      // Remove from upcoming appointments
      setUpcomingAppointments(upcomingAppointments.filter(app => app.id !== appointmentId));
      
      toast({
        title: "התור בוטל",
        description: "התור הועבר להיסטוריית התורים",
      });
    }
  };

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointmentId: number) => {
    toast({
      title: "שינוי תור",
      description: "פונקציונליות זו תהיה זמינה בקרוב",
    });
    // This would open a calendar dialog in a full implementation
  };

  // Handle user details update
  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call an API
    toast({
      title: "פרטים עודכנו",
      description: "פרטי המשתמש עודכנו בהצלחה",
    });
    
    setShowUpdateDetailsDialog(false);
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "סיסמאות לא תואמות",
        description: "אנא ודא שהסיסמאות החדשות זהות",
      });
      return;
    }
    
    // In a real app, this would call an API
    toast({
      title: "סיסמא שונתה",
      description: "הסיסמא שונתה בהצלחה",
    });
    
    // Reset form and close dialog
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePasswordDialog(false);
  };

  // Navigate to add review page
  const handleAddReview = (instituteId: number, therapistId: number) => {
    navigate(`/add-review/${instituteId}/${therapistId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile sidebar */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{user?.name}</CardTitle>
                  <p className="text-gray-500">{user?.email}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      className="w-full" 
                      onClick={() => setShowUpdateDetailsDialog(true)}
                    >
                      עדכן פרטים
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => setShowChangePasswordDialog(true)}
                    >
                      שנה סיסמה
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      התנתק
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>תורים והיסטוריה</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upcoming">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upcoming">תורים קרובים</TabsTrigger>
                      <TabsTrigger value="history">היסטוריית תורים</TabsTrigger>
                    </TabsList>
                    
                    {/* Upcoming appointments */}
                    <TabsContent value="upcoming" className="mt-4">
                      {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingAppointments.map(appointment => (
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg">{appointment.instituteName}</h3>
                                  <p className="text-gray-700">{appointment.service}</p>
                                  <p className="text-sm text-gray-600">מטפל: {appointment.therapistName}</p>
                                  <div className="flex items-center mt-2">
                                    <Calendar className="h-4 w-4 ml-1" />
                                    <span className="text-sm">{appointment.date}</span>
                                    <Clock className="h-4 w-4 mx-1 mr-3" />
                                    <span className="text-sm">{appointment.time}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRescheduleAppointment(appointment.id)}
                                  >
                                    שינוי תור
                                  </Button>
                                  <Button 
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    ביטול תור
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">אין לך תורים קרובים.</p>
                          <Button 
                            className="mt-4" 
                            onClick={() => navigate('/find-institute')}
                          >
                            הזמן תור
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Appointment history */}
                    <TabsContent value="history" className="mt-4">
                      {pastAppointments.length > 0 ? (
                        <div className="space-y-4">
                          {pastAppointments.map(appointment => (
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg">{appointment.instituteName}</h3>
                                  <p className="text-gray-700">{appointment.service}</p>
                                  <p className="text-sm text-gray-600">מטפל: {appointment.therapistName}</p>
                                  <div className="flex items-center mt-2">
                                    <Calendar className="h-4 w-4 ml-1" />
                                    <span className="text-sm">{appointment.date}</span>
                                    <Clock className="h-4 w-4 mx-1 mr-3" />
                                    <span className="text-sm">{appointment.time}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                                    appointment.status === 'הושלם' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {appointment.status}
                                  </span>
                                  
                                  {appointment.status === 'הושלם' && (
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="mt-2 flex items-center"
                                      onClick={() => handleAddReview(appointment.instituteId, appointment.therapistId)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      הוסף ביקורת
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">אין לך היסטוריית תורים.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update details dialog */}
      <Dialog open={showUpdateDetailsDialog} onOpenChange={setShowUpdateDetailsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>עדכון פרטים אישיים</DialogTitle>
            <DialogDescription>
              שנה את הפרטים האישיים שלך ולחץ על "שמור" כדי לעדכן.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateDetails}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input 
                  id="name" 
                  value={userDetails.name} 
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">אימייל</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={userDetails.email} 
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input 
                  id="phone" 
                  value={userDetails.phone} 
                  onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">כתובת</Label>
                <Input 
                  id="address" 
                  value={userDetails.address} 
                  onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowUpdateDetailsDialog(false)}>
                ביטול
              </Button>
              <Button type="submit">
                שמור
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Change password dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>שינוי סיסמה</DialogTitle>
            <DialogDescription>
              הכנס את הסיסמה הנוכחית והסיסמה החדשה.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleChangePassword}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
                <Input 
                  id="currentPassword" 
                  type="password"
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="newPassword">סיסמה חדשה</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">אימות סיסמה חדשה</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
                ביטול
              </Button>
              <Button type="submit">
                שמור
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
