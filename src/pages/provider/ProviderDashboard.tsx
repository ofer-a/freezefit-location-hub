
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  Calendar, 
  Users, 
  Store, 
  User, 
  MessageSquare, 
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ProviderDashboard = () => {
  const { isAuthenticated, user } = useAuth();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">לוח בקרה של ספק שירות</h1>
            <p className="text-gray-600 mt-1">ברוך הבא, {user?.name}</p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סה״כ תורים</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  כל התורים במערכת
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תורים פעילים</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confirmedAppointments.length + pendingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  תורים מאושרים וממתינים
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תורים שהושלמו</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  תורים שבוצעו בהצלחה
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תורים שבוטלו</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cancelledAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  תורים שבוטלו
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/order-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    ניהול הזמנות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    נהל תורים, אשר או בטל הזמנות, וצפה בלוח הזמנים שלך
                  </p>
                  {rescheduleRequests.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600 font-medium">
                      {rescheduleRequests.length} בקשות לשינוי זמן ממתינות
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/store-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="mr-2 h-5 w-5" />
                    ניהול חנות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    נהל את השירותים, המחירים והמלאי שלך
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/user-page-management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    ניהול דף המכון
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    נהל את פרטי המטפלים, גלריה וביקורות הלקוחות
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/customer-inquiries">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    פניות לקוחות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    צפה וענה על פניות ושאלות מלקוחות
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProviderDashboard;
