
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Calendar, ArrowLeft, Search, CheckCircle } from 'lucide-react';

const CustomerInquiries = () => {
  const { isAuthenticated, user } = useAuth();
  const { contactInquiries } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter inquiries based on search
  const filteredInquiries = contactInquiries.filter(inquiry => 
    inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if user is authenticated and is a provider
  if (!isAuthenticated || user?.role !== 'provider') {
    navigate('/login');
    return null;
  }

  const handleReply = (inquiryEmail: string) => {
    toast({
      title: "נשלחה תשובה",
      description: `הדוא"ל נשלח אל ${inquiryEmail}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">פניות לקוחות</h1>
              <p className="text-gray-600 mt-1">ניהול פניות מטופחים מדף הבית</p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="חפש לפי שם או נושא..."
                  className="pr-10 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  חזרה ללוח הבקרה
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>פניות לקוחות ({contactInquiries.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInquiries.length > 0 ? (
                <div className="space-y-6">
                  {filteredInquiries.map((inquiry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-5">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex items-start space-x-4 rtl:space-x-reverse">
                          <div className="w-12 h-12 bg-freezefit-50 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-freezefit-300" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{inquiry.name}</h3>
                            <p className="text-sm text-gray-600">{inquiry.email}</p>
                            <div className="mt-1 flex items-center text-gray-500">
                              <Calendar className="h-4 w-4 ml-1" />
                              <span className="text-sm">
                                {new Date(inquiry.submittedAt).toLocaleDateString('he-IL')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <Button
                            onClick={() => handleReply(inquiry.email)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            השב ללקוח
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-md">{inquiry.subject}</h4>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {inquiry.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">אין פניות חדשות</h3>
                  <p className="text-gray-600">פניות חדשות יופיעו כאן</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomerInquiries;
