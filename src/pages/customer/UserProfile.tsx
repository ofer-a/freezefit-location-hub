import { useState, useEffect } from 'react';
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
import { formatHebrewDate } from '@/lib/utils';
import { User, Calendar, Clock, MessageSquare, Award, Gift, Check, Mail, Upload, Camera } from 'lucide-react';
import RescheduleDialog from '@/components/appointments/RescheduleDialog';
import DeleteAccountDialog from '@/components/ui/dialog-delete-account';
import MessageBox from '@/components/messages/MessageBox';
import { dbOperations } from '@/lib/database';

const UserProfile = () => {
  const { isAuthenticated, user, logout, isLoading, changePassword } = useAuth();
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
  const [selectedGift, setSelectedGift] = useState<{id: string; name: string; pointsCost: number} | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  
  // Form states
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile image state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Load extended user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;

      try {
        // Get full profile data from database
        const profile = await dbOperations.getProfile(user.id);
        
        if (profile) {
          setUserDetails({
            name: profile.full_name || '',
            email: profile.email || '',
            phone: (profile as any).phone || '',
            address: profile.address || ''
          });
        }

        // Load profile image if exists
        try {
          const imageData = await dbOperations.getImage('profiles', user.id);
          if (imageData) {
            setProfileImage(`data:image/jpeg;base64,${imageData}`);
          }
        } catch (error) {
          // Image not found or error loading - this is normal for new users
          console.log('No profile image found or error loading:', error);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Handle profile image upload
  const handleProfileImageUpload = async (file: File) => {
    try {
      // Get file extension from the actual file
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast({
          title: "שגיאה",
          description: "סוג קובץ לא נתמך. אנא בחר תמונה בפורמט JPG, PNG, GIF או WebP",
          variant: "destructive",
        });
        return;
      }
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          const mimeType = file.type;
          const imageUrl = `/.netlify/functions/image-upload/profiles/${user?.id}`;
          
          // Upload image data to database
          await dbOperations.uploadImage('profiles', user?.id || '', base64Data.split(',')[1], mimeType, imageUrl);
          
          // Update local state
          setProfileImage(base64Data);
          setProfileImageFile(file);
          
          toast({
            title: "תמונת פרופיל עודכנה",
            description: "תמונת הפרופיל נשמרה בהצלחה במסד הנתונים",
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "שגיאה",
            description: "לא ניתן לשמור את תמונת הפרופיל",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את תמונת הפרופיל",
        variant: "destructive",
      });
    }
  };

  // Handle profile image selection
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProfileImageUpload(e.target.files[0]);
    }
  };

  // Check authentication
  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/profile' } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle appointment cancellation - check if it's pending or confirmed
  const handleCancelAppointment = (appointmentId: string) => {
    const isPending = pendingAppointments.some(apt => apt.id === appointmentId);
    const currentStatus = isPending ? 'pending' : 'confirmed';
    
    updateAppointmentStatus(appointmentId, currentStatus, 'cancelled');
    
    toast({
      title: "התור בוטל",
      description: "התור הועבר להיסטוריית התורים",
    });
  };

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointmentId: string) => {
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
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לעדכן פרטים ללא התחברות",
      });
      return;
    }

    try {
      // Update profile in database
      await dbOperations.updateProfile(user.id, {
        full_name: userDetails.name,
        email: userDetails.email,
        address: userDetails.address
      });
      
      toast({
        title: "פרטים עודכנו",
        description: "פרטי המשתמש עודכנו בהצלחה",
      });
      
      setShowUpdateDetailsDialog(false);
    } catch (error) {
      console.error('Error updating user details:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לעדכן את הפרטים",
      });
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "סיסמאות לא תואמות",
        description: "אנא ודא שהסיסמאות החדשות זהות",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "סיסמה קצרה מדי",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
      });
      return;
    }
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בשינוי סיסמה",
        description: error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה",
      });
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את החשבון ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try to delete/deactivate user profile from database
      const result: {deleted?: boolean, deactivated?: boolean, hasAppointments: boolean, hasReviews: boolean, message: string} = await dbOperations.deleteProfile(user.id);
      
      if (result.deactivated) {
        // Account was deactivated instead of deleted
        toast({
          title: "חשבון הושבת",
          description: "החשבון שלך הושבת בהצלחה. לא ניתן למחוק חשבון עם תורים או ביקורות קיימות",
        });
      } else if (result.deleted) {
        // Account was fully deleted
        toast({
          title: "חשבון נמחק",
          description: "החשבון שלך נמחק בהצלחה מהמערכת",
        });
      }
      
      // Logout and redirect to home
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את החשבון",
        variant: "destructive",
      });
    }
  };

  // Navigate to add review page
  const handleAddReview = (instituteId: string, therapistId: string | null, anonymous: boolean = false) => {
    // Navigate with anonymous flag in state instead of query param
    const path = therapistId 
      ? `/add-review/${instituteId}/${therapistId}`
      : `/add-review/${instituteId}`;
    
    navigate(path, { state: { anonymous } });
  };

  // Progress calculation for club level
  const progressPercentage = (userClub.points / userClub.nextLevelPoints) * 100;
  
  // Handle gift redemption
  const handleRedeemGift = (gift: {id: string; name: string; pointsCost: number}) => {
    setSelectedGift({...gift, id: gift.id});
    setShowRedeemGiftDialog(true);
  };

  const confirmRedeemGift = async () => {
    if (selectedGift) {
      try {
        await redeemGift(selectedGift.id);
        
        toast({
          title: "מתנה נפדתה בהצלחה",
          description: `נפדתה ${selectedGift.name} תמורת ${selectedGift.pointsCost} נקודות`,
        });
        
        setShowRedeemGiftDialog(false);
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "לא ניתן לפדות את המתנה. נסה שוב.",
          variant: "destructive",
        });
      }
    }
  };


  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">בודק הרשאות...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative group overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full" 
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer">
                        <Camera className="h-6 w-6 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                        />
                      </label>
                    </div>
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
                      variant="destructive"
                      onClick={() => setShowDeleteAccountDialog(true)}
                    >
                      מחק חשבון
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
                                      <span className="text-sm">{formatHebrewDate(appointment.date)}</span>
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
                                    <span className="text-sm">{formatHebrewDate(appointment.date)}</span>
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
                                        onClick={() => handleAddReview(appointment.instituteId, appointment.therapistId, false)}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                        הוסף ביקורת
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
        appointmentId={selectedAppointmentId ? parseInt(selectedAppointmentId.split('-')[0], 16) : 0}
      />

      {/* Delete account dialog */}
      <DeleteAccountDialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
        onConfirmDelete={handleDeleteAccount}
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
