
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Calendar, Users, Store, User, MessageSquare, FileText, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { dbOperations } from '@/lib/database';

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

  // Recent activities state - now loaded from database
  const [recentActivities, setRecentActivities] = useState([]);

  // Load activities from database
  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.id) return;

      try {
        // Get user's institutes
        const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
        if (userInstitutes.length === 0) return;

        // Load activities for the first institute
        const activities = await dbOperations.getActivitiesByInstitute(userInstitutes[0].id, 5);
        
        // Transform activities to match expected format
        const transformedActivities = activities.map((activity, index) => ({
          id: index + 1,
          type: activity.activity_type,
          message: activity.title,
          time: getRelativeTime(new Date(activity.created_at)),
          description: activity.description,
          color: getActivityColor(activity.activity_type)
        }));
        
        setRecentActivities(transformedActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };

    loadActivities();
  }, [user?.id]);

  // Helper function to get relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `לפני ${diffMins} דקות`;
    } else if (diffHours < 24) {
      return `לפני ${diffHours} שעות`;
    } else {
      return `לפני ${diffDays} ימים`;
    }
  };

  // Helper function to get activity color
  const getActivityColor = (type) => {
    switch (type) {
      case 'appointment': return 'green';
      case 'review': return 'yellow';
      case 'registration': return 'purple';
      case 'update': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">שלום, {user?.name || 'ספק שירות'}</h1>
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
            
            <Link to="/customer-inquiries">
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

            <Link to="/analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <CardTitle className="flex flex-col items-center text-base space-y-2">
                    <BarChart3 className="h-8 w-8 text-red-600" />
                    ניתוח נתונים
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 text-sm">
                    צפייה בניתוח נתונים מתקדם וגרפים
                  </p>
                </CardContent>
              </Card>
            </Link>
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
                
                <div className="text-center mt-4">
                  <Link to="/analytics">
                    <Button variant="outline" className="w-full hover:bg-blue-50 transition-colors">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      צפייה בניתוח נתונים מתקדם
                    </Button>
                  </Link>
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
    </div>
  );
};

export default ProviderDashboard;
