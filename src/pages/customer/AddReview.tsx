
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AddReview = () => {
  const { instituteId, therapistId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login', { state: { redirectTo: `/add-review/${instituteId}/${therapistId}` } });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would submit this to your backend
    toast({
      title: "תודה על הביקורת שלך!",
      description: "הביקורת נשלחה בהצלחה ותפורסם לאחר אישור",
    });
    
    // Navigate back
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-10 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">הוספת ביקורת</CardTitle>
              <CardDescription className="text-center">
                שתף את החוויה שלך ועזור למשתמשים אחרים לקבל החלטה מושכלת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">דירוג</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 focus:outline-none"
                        onClick={() => setRating(star)}
                      >
                        <Star 
                          className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Review Text */}
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">הביקורת שלך</label>
                  <Textarea
                    id="review"
                    placeholder="שתף את החוויה שלך..."
                    rows={6}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
                
                {/* Optional Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">כותרת (אופציונלי)</label>
                  <Input
                    id="title"
                    placeholder="תן כותרת לביקורת שלך"
                  />
                </div>
                
                {/* Anonymous Option */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    פרסם כמשתמש אנונימי
                  </label>
                </div>
                
                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCancel}
                  >
                    ביטול
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-freezefit-300 hover:bg-freezefit-400 text-white"
                    disabled={rating === 0 || !reviewText.trim()}
                  >
                    שלח ביקורת
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AddReview;
