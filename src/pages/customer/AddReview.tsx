
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Star, ArrowLeft } from 'lucide-react';

// Mock data for institute and therapist
const mockInstitutes = [
  {
    id: 1,
    name: 'מרכז קריוסטיים',
    address: 'רחוב הרצל 15, תל אביב',
    therapists: [
      { id: 1, name: 'דני כהן', specialty: 'ספורטאים', experience: 5 },
      { id: 2, name: 'מיכל לוי', specialty: 'שיקום', experience: 8 }
    ]
  },
  {
    id: 2,
    name: 'קריו פלוס',
    address: 'דרך מנחם בגין 132, תל אביב',
    therapists: [
      { id: 3, name: 'רונית דוד', specialty: 'קריותרפיה', experience: 10 },
    ]
  },
  {
    id: 3,
    name: 'אייס פיט',
    address: 'רחוב אבן גבירול 30, תל אביב',
    therapists: [
      { id: 4, name: 'אלון ברק', specialty: 'ספורטאי עילית', experience: 7 },
      { id: 5, name: 'נועה פרץ', specialty: 'שחזור שריר', experience: 6 }
    ]
  }
];

const AddReview = () => {
  const { instituteId, therapistId } = useParams<{ instituteId: string; therapistId: string }>();
  const { isAuthenticated, user } = useAuth();
  const { addReview } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for review form
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  
  // Find institute and therapist from params
  const institute = mockInstitutes.find(institute => institute.id === Number(instituteId));
  const therapist = institute?.therapists.find(therapist => therapist.id === Number(therapistId));

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/add-review/${instituteId}/${therapistId}` } });
    }
  }, [isAuthenticated, navigate, instituteId, therapistId]);

  // Check if institute and therapist exist
  useEffect(() => {
    if (!institute || !therapist) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא נמצא מכון או מטפל מתאים",
      });
      navigate('/find-institute');
    }
  }, [institute, therapist, toast, navigate]);

  // Handle submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא בחר דירוג",
      });
      return;
    }
    
    if (!user || !institute || !therapist) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "שגיאה במערכת, אנא נסה שוב",
      });
      return;
    }
    
    // Create review object
    const newReview = {
      id: Date.now().toString(),
      customerName: isAnonymous ? 'אנונימי' : user.name,
      customerId: user.id,
      instituteName: institute.name,
      instituteId: Number(instituteId),
      therapistName: therapist.name,
      therapistId: Number(therapistId),
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
  };

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
              {institute && therapist && (
                <div>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold">{institute.name}</h2>
                    <p className="text-gray-600">מטפל: {therapist.name}</p>
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
