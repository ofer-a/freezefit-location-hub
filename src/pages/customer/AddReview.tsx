
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { dbOperations } from '@/lib/database';
import { Star, ArrowLeft } from 'lucide-react';

// This component now loads institute data from the database via useEffect

const AddReview = () => {
  const { instituteId, therapistId } = useParams<{ instituteId: string; therapistId?: string }>();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { addReview } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get anonymous flag from navigation state
  const anonymousFromState = location.state?.anonymous || false;

  // State for review form
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(anonymousFromState);
  
  // Find institute and therapist from params
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load institute data from database
  useEffect(() => {
    const loadInstitute = async () => {
      try {
        if (!instituteId) {
          setLoading(false);
          return;
        }

        const foundInstitute = await dbOperations.getInstitute(instituteId);
        
        if (foundInstitute) {
          const therapists = await dbOperations.getTherapistsByInstitute(foundInstitute.id, false); // Only active therapists
          setInstitute({
            id: foundInstitute.id,
            name: foundInstitute.institute_name,
            address: foundInstitute.address,
            therapists: therapists.map(therapist => ({
              id: therapist.id,
              name: therapist.name,
              specialty: therapist.bio || 'מטפל מוסמך',
              experience: parseInt(therapist.experience?.split(' ')[0] || '5')
            }))
          });
        } else {
          console.error('Institute not found:', instituteId);
          toast({
            title: "שגיאה",
            description: "לא נמצא מכון מתאים",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading institute:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את פרטי המכון",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInstitute();
  }, [instituteId, toast]);
  
  // Find therapist by UUID string match
  const therapist = therapistId ? institute?.therapists.find(t => t.id === therapistId) : null;

  // Check authentication
  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      const redirectPath = therapistId ? `/add-review/${instituteId}/${therapistId}` : `/add-review/${instituteId}`;
      navigate('/login', { state: { redirectTo: redirectPath } });
    }
  }, [isAuthenticated, isLoading, navigate, instituteId, therapistId]);

  // Check if institute exists (therapist is optional) - only after loading is complete
  useEffect(() => {
    if (!loading && !isLoading && !institute) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא נמצא מכון מתאים",
      });
      navigate('/find-institute');
    }
  }, [institute, loading, isLoading, toast, navigate]);

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא בחר דירוג",
      });
      return;
    }
    
    if (!user || !institute) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "שגיאה במערכת, אנא נסה שוב",
      });
      return;
    }
    
    // If therapistId was provided but therapist not found, show error
    if (therapistId && !therapist) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא נמצא מטפל מתאים",
      });
      return;
    }
    
    try {
      // Create review object for database
      const reviewData = {
        user_id: user.id,
        institute_id: instituteId!,
        rating,
        content: reviewText,
        review_date: new Date().toISOString().split('T')[0],
        is_anonymous: isAnonymous
      };
      
      // Save review to database
      const dbReview = await dbOperations.createReview(reviewData);
      
      // Create activity record
      await dbOperations.createActivity({
        institute_id: instituteId!,
        user_id: user.id,
        activity_type: 'review',
        title: `ביקורת חדשה התקבלה - ${rating} כוכבים`,
        description: `${isAnonymous ? 'לקוח אנונימי' : user.name} השאיר ביקורת עם דירוג ${rating} כוכבים`,
        reference_id: dbReview.id
      });
      
      // Create review object for local state
      const newReview = {
        id: dbReview.id,
        customerName: isAnonymous ? 'אנונימי' : user.name,
        customerId: user.id,
        instituteName: institute.name,
        instituteId: parseInt(instituteId!.split('-')[0], 16), // Convert UUID to number for compatibility
        therapistName: therapist?.name || 'כללי',
        therapistId: therapistId ? parseInt(therapistId.split('-')[0], 16) : 0,
        rating,
        reviewText,
        isAnonymous,
        submittedAt: new Date()
      };
      
      // Add review to context
      addReview(newReview);
      
      toast({
        title: "תודה על הביקורת!",
        description: "הביקורת שלך נשלחה בהצלחה ותוצג בעמוד המכון",
      });
      
      // Redirect back to user profile
      navigate('/profile');
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לשמור את הביקורת. אנא נסה שוב.",
      });
    }
  };

  // Show loading spinner while authentication or institute data is being loaded
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{isLoading ? 'בודק הרשאות...' : 'טוען פרטי מכון...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            חזרה
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">הוספת ביקורת</CardTitle>
            </CardHeader>
            <CardContent>
              {institute && (
                <div>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold">{institute.name}</h2>
                    {therapist && <p className="text-gray-600">מטפל: {therapist.name}</p>}
                    {!therapist && <p className="text-gray-600">ביקורת כללית על המכון</p>}
                  </div>
                  
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div className="space-y-2">
                      <Label>דירוג</Label>
                      <div className="flex justify-center items-center">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 focus:outline-none"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  (hoverRating || rating) >= star
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reviewText">ביקורת</Label>
                      <Textarea
                        id="reviewText"
                        placeholder="ספר לנו על החוויה שלך..."
                        rows={5}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox 
                        id="anonymous" 
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                      />
                      <Label 
                        htmlFor="anonymous"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        הצג כביקורת אנונימית
                      </Label>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" className="w-full md:w-auto">
                        שלח ביקורת
                      </Button>
                    </div>
                  </form>
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

export default AddReview;
