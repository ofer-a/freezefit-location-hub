import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Calendar, Users, Store, User, MessageSquare, FileText, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import ReportDialog from '@/components/reports/ReportDialog';

const ProviderDashboard = () => {
  const {
    isAuthenticated,
    user
  } = useAuth();
  const {
    confirmedAppointments,
    historyAppointments,
    pendingAppointments,
    rescheduleRequests
  } = useData();
  const navigate = useNavigate();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Calculate statistics
  const totalAppointments = confirmedAppointments.length + historyAppointments.length + pendingAppointments.length;
  const completedAppointments = historyAppointments.filter(apt => apt.status === 'הושלם').length;
  const cancelledAppointments = historyAppointments.filter(apt => apt.status === 'בוטל').length;

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = confirmedAppointments.filter(apt => apt.date === today).slice(0, 3);

  // Get recent activities
  const recentActivities = [{
    id: 1,
    type: 'appointment',
    message: 'חמדה חדשה מיוסי כהן',
    time: 'לפני 30 דקות',
    date: '15/05/25',
    color: 'green'
  }, {
    id: 2,
    type: 'update',
    message: 'עדכון מחירון',
    time: 'לפני שעתיים',
    description: 'עדכנת את מחירי הטיפולים',
    color: 'blue'
  }, {
    id: 3,
    type: 'review',
    message: 'לקוח חדש נרשם',
    time: 'לפני 5 שעות',
    description: 'רנית לוי נרשמה לאתר',
    color: 'purple'
  }, {
    id: 4,
    type: 'review',
    message: 'ביקורת חדשה',
    time: 'אתמול, 14:20',
    description: 'ביקורת חדשה נקבלה (4.5 כוכבים)',
    color: 'yellow'
  }];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">שלום, ספק שירות לדוגמה</h1>
            <p className="text-gray-600 mt-1">ברוך הבא ללוח הבקרה שלך</p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תורים להיום</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תורים בהמתנה</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סה״כ לקוחות</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">הכנסות שבועיות</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪4,850</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Link to="/order-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <CardTitle className="flex flex-col items-center text-base space-y-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    ניהול הזמנות
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 text-sm">
                    צפייה וניהול בהזמנות, תורים ממתינים והיסטוריה
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/store-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <CardTitle className="flex flex-col items-center text-base space-y-2">
                    <Store className="h-8 w-8 text-green-600" />
                    ניהול חנות
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 text-sm">
                    ניהול שעות פתיחה, סגירות ומחירון
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/user-page-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <CardTitle className="flex flex-col items-center text-base space-y-2">
                    <Users className="h-8 w-8 text-purple-600" />
                    עיצוב דף למטפלים
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 text-sm">
                    פרטי מטפלים, גלריה והתייחסות לקוחות
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/order-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <CardTitle className="flex flex-col items-center text-base space-y-2">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                    פניות לקוחות
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 text-sm">
                    צפייה וטיפול בפניות חדשות מלקוחות
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer h-full"
              onClick={() => setReportDialogOpen(true)}
            >
              <CardHeader className="text-center">
                <CardTitle className="flex flex-col items-center text-base space-y-2">
                  <FileText className="h-8 w-8 text-red-600" />
                  יצירת דוח
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-gray-600 text-sm">
                  יצירת דוחות מפורטים על הכנסות ותורים
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  תורים להיום
                </CardTitle>
                <p className="text-sm text-gray-600">צפייה בתורים המתוכננים להיום</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">יוסי כהן</p>
                      <p className="text-sm text-gray-600">טיפול קרטוגני, 45 דקות</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">10:00</p>
                      <span className="text-xs text-green-600">✓ מאושר</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">רנית לוי</p>
                      <p className="text-sm text-gray-600">טיפול ספורטיים, 60 דקות</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">12:30</p>
                      <span className="text-xs text-green-600">✓ מאושר</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">משה גולן</p>
                      <p className="text-sm text-gray-600">טיפול ראשון, 60 דקות</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">15:00</p>
                      <span className="text-xs text-yellow-600">⚠ בהמתנה</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center" onClick={() => navigate('/analytics')}>
                  <Button variant="outline" className="w-full hover:bg-blue-50 transition-colors cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    צפייה בניתוח נתונים מתקדם
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>פעילות אחרונה</CardTitle>
                <p className="text-sm text-gray-600">עדכונים אחרונים במערכת</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className={`flex items-start space-x-3 p-3 border-r-4 border-r-${activity.color}-500 bg-gray-50 rounded`}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.message}</p>
                        {activity.description && (
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full">
                    צפייה בכל הפעילות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <ReportDialog 
        open={reportDialogOpen} 
        onOpenChange={setReportDialogOpen} 
      />
    </div>
  );
};

export default ProviderDashboard;
