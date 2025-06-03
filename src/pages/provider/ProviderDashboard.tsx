
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  Calendar, 
  UserCog, 
  Store, 
  ClipboardList, 
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Feature cards for the provider dashboard
const featureCards = [
  {
    title: 'ניהול הזמנות',
    description: 'צפייה וניהול בהזמנות, תורים ממתינים והיסטוריה',
    icon: ClipboardList,
    link: '/order-management',
    color: 'bg-blue-50'
  },
  {
    title: 'ניהול חנות',
    description: 'ניהול שעות פתיחה, סדנאות ומחירון',
    icon: Store,
    link: '/store-management',
    color: 'bg-green-50'
  },
  {
    title: 'עיצוב דף למשתמש',
    description: 'פרטי מטפלים, גלריה וחוויות לקוחות',
    icon: UserCog,
    link: '/user-page-management',
    color: 'bg-purple-50'
  },
  {
    title: 'פניות לקוחות',
    description: 'צפייה וטיפול בפניות חדשות מלקוחות',
    icon: MessageSquare,
    link: '/customer-inquiries',
    color: 'bg-yellow-50'
  }
];

const ProviderDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { 
    pendingAppointments, 
    confirmedAppointments, 
    historyAppointments,
    contactInquiries
  } = useData();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Calculate real-time metrics from context data
  const todaysAppointments = confirmedAppointments.filter(appointment => {
    // Check if appointment is for today
    const today = new Date();
    const [day, month, year] = appointment.date.split('/');
    const appointmentDate = new Date(`${year}-${month}-${day}`);
    return appointmentDate.getDate() === today.getDate() && 
           appointmentDate.getMonth() === today.getMonth() && 
           appointmentDate.getFullYear() === today.getFullYear();
  }).length;

  const pendingAppointmentsCount = pendingAppointments.length;
  const totalCustomers = [...new Set([
    ...confirmedAppointments.map(a => a.customerName),
    ...pendingAppointments.map(a => a.customerName),
    ...historyAppointments.map(a => a.customerName)
  ])].length;

  // Calculate weekly revenue (mock data - in a real app, this would come from actual payment data)
  const weeklyRevenue = '₪4,850';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          {/* Welcome section */}
          <div className="mb-10">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">שלום, {user?.name}</h1>
              <p className="text-gray-600">ברוך הבא ללוח הבקרה שלך</p>
            </div>
          </div>
          
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">תורים להיום</p>
                    <p className="text-2xl font-bold">{todaysAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">תורים בהמתנה</p>
                    <p className="text-2xl font-bold">{pendingAppointmentsCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">סה"כ לקוחות</p>
                    <p className="text-2xl font-bold">{totalCustomers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">הכנסות שבועיות</p>
                    <p className="text-2xl font-bold">{weeklyRevenue}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {featureCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={index} to={card.link} className="block">
                  <Card className="h-full transition-all hover:shadow-md hover:border-freezefit-300">
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-freezefit-300" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>תורים להיום</CardTitle>
                <CardDescription>צפייה בתורים המתוכננים להיום</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {confirmedAppointments
                    .filter(appointment => {
                      // Check if appointment is for today
                      const today = new Date();
                      const [day, month, year] = appointment.date.split('/');
                      const appointmentDate = new Date(`${year}-${month}-${day}`);
                      return appointmentDate.getDate() === today.getDate() && 
                             appointmentDate.getMonth() === today.getMonth() && 
                             appointmentDate.getFullYear() === today.getFullYear();
                    })
                    .slice(0, 3)
                    .map(appointment => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{appointment.customerName}</p>
                          <p className="text-sm text-gray-600">{appointment.service}, {appointment.duration}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 ml-1" /> מאושר
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {pendingAppointments
                    .slice(0, 1)
                    .map(appointment => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{appointment.customerName}</p>
                          <p className="text-sm text-gray-600">{appointment.service}, {appointment.duration}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-yellow-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 ml-1" /> בהמתנה
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {confirmedAppointments.length === 0 && pendingAppointments.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500">אין תורים להיום</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={() => navigate('/order-management')}>
                    צפייה בכל התורים
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>פעילות אחרונה</CardTitle>
                <CardDescription>עדכונים אחרונים במערכת</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAppointments.length > 0 && (
                    <div className="border-r-2 border-green-500 pr-4">
                      <p className="text-sm text-gray-500">לפני {Math.floor(Math.random() * 60)} דקות</p>
                      <p className="font-medium">הזמנה חדשה מ{pendingAppointments[0].customerName}</p>
                      <p className="text-sm text-gray-600">הזמנת תור לתאריך {pendingAppointments[0].date}</p>
                    </div>
                  )}
                  
                  <div className="border-r-2 border-blue-500 pr-4">
                    <p className="text-sm text-gray-500">לפני שעתיים</p>
                    <p className="font-medium">עדכון מחירון</p>
                    <p className="text-sm text-gray-600">עדכנת את מחירי הטיפולים</p>
                  </div>
                  
                  <div className="border-r-2 border-purple-500 pr-4">
                    <p className="text-sm text-gray-500">לפני 5 שעות</p>
                    <p className="font-medium">לקוח חדש נרשם</p>
                    <p className="text-sm text-gray-600">רונית לוי נרשמה לאתר</p>
                  </div>
                  
                  {contactInquiries.length > 0 && (
                    <div className="border-r-2 border-yellow-500 pr-4">
                      <p className="text-sm text-gray-500">
                        {contactInquiries[0].submittedAt.toLocaleDateString('he-IL')}
                      </p>
                      <p className="font-medium">פנייה חדשה</p>
                      <p className="text-sm text-gray-600">
                        פנייה חדשה מ{contactInquiries[0].name}
                      </p>
                    </div>
                  )}
                  
                  {pendingAppointments.length === 0 && contactInquiries.length === 0 && (
                    <div className="border-r-2 border-yellow-500 pr-4">
                      <p className="text-sm text-gray-500">אתמול, 14:20</p>
                      <p className="font-medium">ביקורת חדשה</p>
                      <p className="text-sm text-gray-600">ביקורת חדשה נתקבלה (4.5 כוכבים)</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    צפייה בכל הפעולות
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
