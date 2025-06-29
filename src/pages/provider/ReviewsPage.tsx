
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Star, ArrowLeft, User } from 'lucide-react';

const ReviewsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { reviews } = useData();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              חזרה ללוח הבקרה
            </Button>
            <h1 className="text-3xl font-bold">ביקורות לקוחות</h1>
          </div>

          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>סיכום ביקורות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-freezefit-300 mb-2">
                    {reviews.length}
                  </div>
                  <div className="text-sm text-gray-600">סה"כ ביקורות</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-freezefit-300 mb-2">
                    {averageRating}
                  </div>
                  <div className="text-sm text-gray-600">דירוג ממוצע</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(parseFloat(averageRating)))}
                  </div>
                  <div className="text-sm text-gray-600">כוכבים</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="border-r-4 border-r-freezefit-300">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-freezefit-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-freezefit-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.customerName}</h3>
                          <p className="text-sm text-gray-600">
                            {review.instituteName} - {review.therapistName}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center mb-1">
                          {renderStars(review.rating)}
                          <span className="mr-2 text-sm font-medium">{review.rating}/5</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {review.submittedAt.toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {review.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            אנונימי
                          </Badge>
                        )}
                        <Badge 
                          variant={review.rating >= 4 ? "default" : review.rating >= 3 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {review.rating >= 4 ? "חיובי" : review.rating >= 3 ? "בינוני" : "שלילי"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Star className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">אין ביקורות עדיין</h3>
                  <p className="text-gray-600">
                    כאשר לקוחות ישלחו ביקורות, הן יופיעו כאן
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ReviewsPage;
