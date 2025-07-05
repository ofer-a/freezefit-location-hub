import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, Clock, MessageSquare, Award, Gift, Check, Mail } from 'lucide-react';
import RescheduleDialog from '@/components/appointments/RescheduleDialog';
import DeleteAccountDialog from '@/components/ui/dialog-delete-account';
import MessageBox from '@/components/messages/MessageBox';

const UserProfile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { userClub, redeemGift, requestReschedule } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get both confirmed and pending appointments for upcoming appointments
  const { 
    confirmedAppointments,
    pendingAppointments,
    historyAppointments: pastAppointments,
    updateAppointmentStatus
  } = useData();
  
  // Combine confirmed and pending appointments for the upcoming list
  const upcomingAppointments = [...confirmedAppointments, ...pendingAppointments];
  
  // Dialog states
  const [showUpdateDetailsDialog, setShowUpdateDetailsDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showRedeemGiftDialog, setShowRedeemGiftDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [selectedGift, setSelectedGift] = useState<{id: number; name: string; pointsCost: number} | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  
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

  // Handle appointment cancellation - check if it's pending or confirmed
  const handleCancelAppointment = (appointmentId: number) => {
    const isPending = pendingAppointments.some(apt => apt.id === appointmentId);
    const currentStatus = isPending ? 'pending' : 'confirmed';
    
    updateAppointmentStatus(appointmentId, currentStatus, 'cancelled');
    
    toast({
      title: "התור בוטל",
      description: "התור הועבר להיסטוריית התורים",
    });
  };

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setShowRescheduleDialog(true);
  };

  // Handle reschedule confirmation
  const handleRescheduleConfirm = (newDate: string, newTime: string) => {
    if (selectedAppointmentId) {
      requestReschedule(selectedAppointmentId, newDate, newTime);
      
      toast({
        title: "בקשת שינוי נשלחה",
        description: "הבקשה לשינוי התור נשלחה לאישור הספק",
      });
    }
  };

  // Handle user details update
  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  const handleAddReview = (instituteId: number, therapistId: number, anonymous: boolean = false) => {
    navigate(`/add-review/${instituteId}/${therapistId}?anonymous=${anonymous}`);
  };

  // Progress calculation for club level
  const progressPercentage = (userClub.points / userClub.nextLevelPoints) * 100;
  
  // Handle gift redemption
  const handleRedeemGift = (gift: {id: number; name: string; pointsCost: number}) => {
    setSelectedGift(gift);
    setShowRedeemGiftDialog(true);
  };

  const confirmRedeemGift = () => {
    if (selectedGift) {
      redeemGift(selectedGift.id);
      
      toast({
        title: "מתנה נפדתה בהצלחה",
        description: `נפדתה ${selectedGift.name} תמורת ${selectedGift.pointsCost} נקודות`,
      });
      
      setShowRedeemGiftDialog(false);
    }
  };

  // Handle user account deletion
  const handleDeleteAccount = async () => {
    try {
      // In a real app, you would call an API to delete the user account
      // For now, we'll simulate the deletion process
      
      toast({
        title: "חשבון נמחק",
        description: "החשבון נמחק בהצלחה",
        variant: "destructive",
      });
      
      // Log out the user and redirect to home page
      logout();
      navigate('/');
      
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת החשבון",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile sidebar */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader className="text-center relative">
                  {/* Delete account button in top-right corner */}
                  <div className="absolute top-4 right-4">
                    <DeleteAccountDialog onConfirmDelete={handleDeleteAccount} />
                  </div>
                  
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
                      className="w-full flex items-center gap-2" 
                      variant="outline"
                      onClick={() => setShowMessageBox(true)}
                    >
                      <Mail className="h-4 w-4" />
                      תיבת הודעות
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
              
              {/* Club membership card */}
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      מועדון לקוחות
                    </CardTitle>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium py-1 px-2 rounded">
                      רמה: {userClub.level}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{userClub.points} נקודות</span>
                      <span>{userClub.nextLevelPoints} נקודות לרמה הבאה</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">ההטבות שלך:</h4>
                    <ul className="space-y-1">
                      {userClub.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/find-institute')}
                  >
                    צבור נקודות בטיפול הבא
                  </Button>
                </CardFooter>
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
                    
                    {/* Upcoming appointments - now shows both confirmed and pending */}
                    <TabsContent value="upcoming" className="mt-4">
                      {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingAppointments.map(appointment => {
                            const isPending = pendingAppointments.some(apt => apt.id === appointment.id);
                            return (
                              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">{appointment.customerName}</h3>
                                    <p className="text-gray-700">{appointment.service}</p>
                                    <div className="flex items-center mt-2">
                                      <Calendar className="h-4 w-4 ml-1" />
                                      <span className="text-sm">{appointment.date}</span>
                                      <Clock className="h-4 w-4 mx-1 mr-3" />
                                      <span className="text-sm">{appointment.time}</span>
                                    </div>
                                    {isPending && (
                                      <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                        ממתין לאישור
                                      </span>
                                    )}
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
                            );
                          })}
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
                                  <h3 className="font-semibold text-lg">{appointment.customerName}</h3>
                                  <p className="text-gray-700">{appointment.service}</p>
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
                                    <div className="mt-2 flex flex-col gap-2">
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => handleAddReview(1, 1, false)}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                        הוסף ביקורת
                                      </Button>
                                      
                                      <Button 
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs flex items-center gap-2"
                                        onClick={() => handleAddReview(1, 1, true)}
                                      >
                                        הוסף ביקורת אנונימית
                                      </Button>
                                    </div>
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
              
              {/* Club gifts section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    מתנות והטבות זמינות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userClub.availableGifts.map((gift) => (
                      <Card key={gift.id} className="overflow-hidden">
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          <img src={gift.image} alt={gift.name} className="h-24 w-24 object-contain" />
                        </div>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold">{gift.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">{gift.pointsCost} נקודות</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={userClub.points < gift.pointsCost}
                              onClick={() => handleRedeemGift(gift)}
                            >
                              פדה מתנה
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
      
      {/* Gift redemption dialog */}
      <Dialog open={showRedeemGiftDialog} onOpenChange={setShowRedeemGiftDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>פדיית מתנה</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך לפדות את המתנה הזו?
            </DialogDescription>
          </DialogHeader>
          
          {selectedGift && (
            <div className="py-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">{selectedGift.name}</h3>
                <p className="text-gray-600">{selectedGift.pointsCost} נקודות</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowRedeemGiftDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={confirmRedeemGift}>
                  אישור פדייה
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Reschedule appointment dialog */}
      <RescheduleDialog
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        onConfirm={handleRescheduleConfirm}
        appointmentId={selectedAppointmentId || 0}
      />

      <MessageBox 
        isOpen={showMessageBox}
        onClose={() => setShowMessageBox(false)}
      />
      
      <Footer />
    </div>
  );
};

export default UserProfile;
