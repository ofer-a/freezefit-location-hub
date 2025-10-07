import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dbOperations } from '@/lib/database';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  username?: string;
  rating: number;
  content: string;
  date: string;
}

interface Institute {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const InstituteReviews = () => {
  const { instituteId } = useParams<{ instituteId: string }>();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!instituteId) return;

      try {
        setLoading(true);

        // Load institute data
        const institutes = await dbOperations.getInstitutes();
        const foundInstitute = institutes.find(inst => inst.id === instituteId);
        
        if (foundInstitute) {
          // Load reviews
          const dbReviews = await dbOperations.getReviewsByInstitute(instituteId);
          
          // Transform reviews
          const transformedReviews = dbReviews.map((review, index) => ({
            id: `${instituteId}-review-${index}-${review.id}`,
            username: review.user_name || `משתמש ${review.id.slice(-4)}`,
            rating: review.rating,
            content: review.content,
            date: review.created_at || review.review_date || new Date().toISOString()
          }));

          // Calculate average rating from reviews
          const averageRating = transformedReviews.length > 0 
            ? transformedReviews.reduce((sum, review) => sum + review.rating, 0) / transformedReviews.length
            : 0;

          setInstitute({
            id: foundInstitute.id,
            name: foundInstitute.institute_name,
            address: foundInstitute.address || 'כתובת לא זמינה',
            rating: averageRating,
            reviewCount: transformedReviews.length
          });
          
          setReviews(transformedReviews);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [instituteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-4 w-48 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!institute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">מכון לא נמצא</h1>
          <Button onClick={() => navigate('/find-institute')}>
            חזרה לחיפוש מכונים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4 p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              חזרה
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ביקורות - {institute.name}
            </h1>
            <p className="text-gray-600">{institute.address}</p>
            
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <StarRating rating={institute.rating} />
                <span className="text-sm text-gray-600">
                  {institute.reviewCount > 0 
                    ? `${institute.rating.toFixed(1)} (${institute.reviewCount} ביקורות)`
                    : 'אין דירוג (0 ביקורות)'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <h3 className="text-lg font-medium">אין ביקורות עדיין</h3>
                    <p className="text-sm mt-1">
                      היה הראשון לכתוב ביקורת על {institute.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {review.username ? review.username.charAt(0) : 'א'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.username || 'משתמש אנונימי'}
                          </p>
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteReviews;
