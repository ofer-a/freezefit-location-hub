
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Calendar, Clock, CheckCircle, AlertTriangle, Archive, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppointmentChangeDialog from '@/components/provider/AppointmentChangeDialog';

const OrderManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    pendingAppointments, 
    confirmedAppointments, 
    historyAppointments,
    updateAppointmentStatus,
    approveAppointmentChange,
    rejectAppointmentChange
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleApprove = (orderId: number) => {
    updateAppointmentStatus(orderId, 'pending', 'confirmed');
    
    toast({
      title: "התור אושר",
      description: "התור עבר לרשימת התורים המאושרים",
    });
  };

  const handleReject = (orderId: number, fromPending: boolean = true) => {
    updateAppointmentStatus(
      orderId, 
      fromPending ? 'pending' : 'confirmed',
      'cancelled'
    );
    
    toast({
      variant: "destructive",
      title: "התור בוטל",
      description: "התור הועבר לרשימת ההיסטוריה כ'בוטל'",
    });
  };

  const handleComplete = (orderId: number) => {
    updateAppointmentStatus(orderId, 'confirmed', 'completed');
    
    toast({
      title: "הטיפול הושלם",
      description: "התור הועבר להיסטוריית התורים",
    });
  };

  const handleApproveChange = (orderId: number) => {
    approveAppointmentChange(orderId);
    
    toast({
      title: "שינוי התור אושר",
      description: "התור עודכן לתאריך והשעה החדשים",
    });
  };

  const handleRejectChange = (orderId: number) => {
    rejectAppointmentChange(orderId);
    
    toast({
      variant: "destructive",
      title: "שינוי התור נדחה",
      description: "התור נשאר במועד המקורי",
    });
  };

  // Filter orders based on search query
  const filteredConfirmedOrders = confirmedAppointments.filter(order => 
    order.customerName.includes(searchQuery) || order.therapistName.includes(searchQuery)
  );
  
  const filteredPendingOrders = pendingAppointments.filter(order => 
    order.customerName.includes(searchQuery) || order.therapistName.includes(searchQuery)
  );
  
  const filteredHistoryOrders = historyAppointments.filter(order => 
    order.customerName.includes(searchQuery) || order.therapistName.includes(searchQuery)
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
                  placeholder="חפש לפי לקוח או מטפל..."
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
                              <p className="text-gray-600">מטפל: {order.therapistName}</p>
                              <p className="text-gray-600">שירות: {order.serviceName}</p>
                              <p className="text-gray-600">{order.duration}</p>
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
                              {order.changeRequested ? (
                                <RefreshCw className="h-6 w-6 text-yellow-500" />
                              ) : (
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{order.customerName}</h3>
                              <p className="text-gray-600">מטפל: {order.therapistName}</p>
                              <p className="text-gray-600">שירות: {order.serviceName}</p>
                              <p className="text-gray-600">{order.duration}</p>
                              <p className="text-sm text-gray-500">טלפון: {order.phone}</p>
                              {order.changeRequested && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                                  <p className="font-medium text-yellow-800">בקשת שינוי מועד</p>
                                  <p className="text-yellow-700">
                                    מועד קודם: {order.originalDate} בשעה {order.originalTime}
                                  </p>
                                </div>
                              )}
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
                              {order.changeRequested ? (
                                <>
                                  <Button 
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    size="sm"
                                    onClick={() => handleApproveChange(order.id)}
                                  >
                                    אשר שינוי
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleRejectChange(order.id)}
                                  >
                                    דחה שינוי
                                  </Button>
                                </>
                              ) : (
                                <>
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
                                </>
                              )}
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
                              <p className="text-gray-600">מטפל: {order.therapistName}</p>
                              <p className="text-gray-600">שירות: {order.serviceName}</p>
                              <p className="text-gray-600">{order.duration}</p>
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
