
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, CheckCircle, AlertTriangle, Archive, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for appointments
type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  duration: string;
  phone?: string;
  status?: 'הושלם' | 'בוטל';
}

const OrderManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for orders/appointments
  const [confirmedOrders, setConfirmedOrders] = useState<Appointment[]>([
    { id: 1, customerName: 'יוסי כהן', date: '15/05/2025', time: '10:00', service: 'טיפול סטנדרטי', duration: '45 דקות', phone: '050-1234567' },
    { id: 2, customerName: 'רונית לוי', date: '15/05/2025', time: '12:30', service: 'טיפול ספורטאים', duration: '60 דקות', phone: '052-9876543' },
    { id: 3, customerName: 'דוד מזרחי', date: '16/05/2025', time: '09:15', service: 'טיפול קצר', duration: '30 דקות', phone: '054-5678901' }
  ]);
  
  const [pendingOrders, setPendingOrders] = useState<Appointment[]>([
    { id: 4, customerName: 'משה גולן', date: '15/05/2025', time: '15:00', service: 'טיפול ראשון', duration: '60 דקות', phone: '053-1112222' },
    { id: 5, customerName: 'מיכל דוידוב', date: '17/05/2025', time: '11:45', service: 'טיפול ספורטאים', duration: '60 דקות', phone: '050-3334444' }
  ]);
  
  const [historyOrders, setHistoryOrders] = useState<Appointment[]>([
    { id: 6, customerName: 'אורי גבאי', date: '10/05/2025', time: '14:00', service: 'טיפול סטנדרטי', duration: '45 דקות', status: 'הושלם' },
    { id: 7, customerName: 'יעל פרץ', date: '11/05/2025', time: '16:30', service: 'טיפול שיקום', duration: '60 דקות', status: 'הושלם' },
    { id: 8, customerName: 'נועם אלוני', date: '08/05/2025', time: '10:00', service: 'טיפול קצר', duration: '30 דקות', status: 'בוטל' }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleApprove = (orderId: number) => {
    // Find the order to approve in pending orders
    const orderToApprove = pendingOrders.find(order => order.id === orderId);
    
    if (orderToApprove) {
      // Add to confirmed orders
      setConfirmedOrders([...confirmedOrders, orderToApprove]);
      
      // Remove from pending orders
      setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
      
      toast({
        title: "התור אושר",
        description: "התור עבר לרשימת התורים המאושרים",
      });
    }
  };

  const handleReject = (orderId: number, fromPending: boolean = true) => {
    // Find the order to reject in the appropriate list
    const ordersList = fromPending ? pendingOrders : confirmedOrders;
    const orderToReject = ordersList.find(order => order.id === orderId);
    
    if (orderToReject) {
      // Add to history with cancelled status
      setHistoryOrders([...historyOrders, { ...orderToReject, status: 'בוטל' }]);
      
      // Remove from original list
      if (fromPending) {
        setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
      } else {
        setConfirmedOrders(confirmedOrders.filter(order => order.id !== orderId));
      }
      
      toast({
        variant: "destructive",
        title: "התור בוטל",
        description: "התור הועבר לרשימת ההיסטוריה כ'בוטל'",
      });
    }
  };

  const handleComplete = (orderId: number) => {
    // Find the order to complete
    const orderToComplete = confirmedOrders.find(order => order.id === orderId);
    
    if (orderToComplete) {
      // Add to history with completed status
      setHistoryOrders([...historyOrders, { ...orderToComplete, status: 'הושלם' }]);
      
      // Remove from confirmed orders
      setConfirmedOrders(confirmedOrders.filter(order => order.id !== orderId));
      
      toast({
        title: "הטיפול הושלם",
        description: "התור הועבר להיסטוריית התורים",
      });
    }
  };

  // Filter orders based on search query
  const filteredConfirmedOrders = confirmedOrders.filter(order => 
    order.customerName.includes(searchQuery)
  );
  
  const filteredPendingOrders = pendingOrders.filter(order => 
    order.customerName.includes(searchQuery)
  );
  
  const filteredHistoryOrders = historyOrders.filter(order => 
    order.customerName.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">ניהול הזמנות</h1>
              <p className="text-gray-600 mt-1">ניהול תורים, אישורים והיסטוריה</p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="חפש לפי שם לקוח..."
                  className="pr-10 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/dashboard">
                <Button variant="outline">חזרה ללוח הבקרה</Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="confirmed" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="confirmed">תורים מאושרים</TabsTrigger>
                  <TabsTrigger value="pending">תורים בהמתנה</TabsTrigger>
                  <TabsTrigger value="history">היסטוריית תורים</TabsTrigger>
                </TabsList>
                
                {/* Confirmed Orders Tab */}
                <TabsContent value="confirmed" className="p-6">
                  <div className="space-y-6">
                    {filteredConfirmedOrders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex items-start space-x-4 rtl:space-x-reverse">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{order.customerName}</h3>
                              <p className="text-gray-600">{order.service}, {order.duration}</p>
                              <p className="text-sm text-gray-500">טלפון: {order.phone}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex items-center">
                            <div className="text-right ml-6">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 ml-1" />
                                <span>{order.date}</span>
                              </div>
                              <div className="flex items-center text-gray-700 mt-1">
                                <Clock className="h-4 w-4 ml-1" />
                                <span>{order.time}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleComplete(order.id)}
                              >
                                סמן כהושלם
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleReject(order.id, false)}
                              >
                                בטל תור
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredConfirmedOrders.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-1">אין תורים מאושרים</h3>
                        <p className="text-gray-600">תורים מאושרים יופיעו כאן</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Pending Orders Tab */}
                <TabsContent value="pending" className="p-6">
                  <div className="space-y-6">
                    {filteredPendingOrders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex items-start space-x-4 rtl:space-x-reverse">
                            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                              <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{order.customerName}</h3>
                              <p className="text-gray-600">{order.service}, {order.duration}</p>
                              <p className="text-sm text-gray-500">טלפון: {order.phone}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex items-center">
                            <div className="text-right ml-6">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 ml-1" />
                                <span>{order.date}</span>
                              </div>
                              <div className="flex items-center text-gray-700 mt-1">
                                <Clock className="h-4 w-4 ml-1" />
                                <span>{order.time}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <Button 
                                className="bg-green-500 hover:bg-green-600 text-white"
                                size="sm"
                                onClick={() => handleApprove(order.id)}
                              >
                                אשר תור
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleReject(order.id)}
                              >
                                דחה תור
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredPendingOrders.length === 0 && (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-1">אין תורים בהמתנה</h3>
                        <p className="text-gray-600">תורים חדשים שטרם אושרו יופיעו כאן</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Order History Tab */}
                <TabsContent value="history" className="p-6">
                  <div className="space-y-6">
                    {filteredHistoryOrders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex items-start space-x-4 rtl:space-x-reverse">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Archive className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{order.customerName}</h3>
                              <p className="text-gray-600">{order.service}, {order.duration}</p>
                              <p className={`text-sm ${order.status === 'הושלם' ? 'text-green-600' : 'text-red-600'}`}>
                                סטטוס: {order.status}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex items-center">
                            <div className="text-right">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 ml-1" />
                                <span>{order.date}</span>
                              </div>
                              <div className="flex items-center text-gray-700 mt-1">
                                <Clock className="h-4 w-4 ml-1" />
                                <span>{order.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredHistoryOrders.length === 0 && (
                      <div className="text-center py-12">
                        <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-1">אין היסטוריית תורים</h3>
                        <p className="text-gray-600">תורים שהושלמו או בוטלו יופיעו כאן</p>
                      </div>
                    )}
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

export default OrderManagement;
