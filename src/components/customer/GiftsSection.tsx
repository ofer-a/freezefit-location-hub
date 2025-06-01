
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { upload, gift } from 'lucide-react';

interface Gift {
  id: string;
  title: string;
  points: number;
  image?: string;
}

const GiftsSection = () => {
  const { toast } = useToast();
  const [gifts, setGifts] = useState<Gift[]>([
    { id: '1', title: 'טיפול מתנה', points: 200 },
    { id: '2', title: 'חולצת מותג', points: 300 },
    { id: '3', title: 'סט אביזרים', points: 500 }
  ]);

  const handleImageUpload = (giftId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא בחר קובץ תמונה בלבד",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "גודל הקובץ צריך להיות קטן מ-5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setGifts(prev => prev.map(gift => 
        gift.id === giftId ? { ...gift, image: imageUrl } : gift
      ));
      
      toast({
        title: "התמונה הועלתה בהצלחה",
        description: "התמונה עודכנה עבור המתנה",
      });
    };
    
    reader.readAsDataURL(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <gift className="h-5 w-5" />
          מתנות והטבות זמינות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gifts.map((gift) => (
            <div key={gift.id} className="border border-gray-200 rounded-lg p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {gift.image ? (
                  <img 
                    src={gift.image} 
                    alt={gift.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <gift className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">לא הועלתה תמונה</p>
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-center mb-2">{gift.title}</h3>
              
              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <span>פדה מתנה</span>
                <span>{gift.points} נקודות</span>
              </div>

              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(gift.id, e)}
                  className="hidden"
                  id={`upload-${gift.id}`}
                />
                <label htmlFor={`upload-${gift.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full cursor-pointer"
                    asChild
                  >
                    <span>
                      <upload className="h-4 w-4 ml-1" />
                      העלה תמונה
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftsSection;
