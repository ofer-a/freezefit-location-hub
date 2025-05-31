
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  url: string;
  category: 'treatment-room' | 'ice-baths' | 'waiting-area';
}

interface PhotoGalleryManagerProps {
  category: 'treatment-room' | 'ice-baths' | 'waiting-area';
  title: string;
  photos: Photo[];
  onPhotoAdd: (photo: Photo) => void;
  onPhotoDelete: (photoId: string) => void;
}

const PhotoGalleryManager = ({ 
  category, 
  title, 
  photos, 
  onPhotoAdd, 
  onPhotoDelete 
}: PhotoGalleryManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);

    try {
      // Simulate file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}`,
          url: e.target?.result as string,
          category
        };
        
        onPhotoAdd(newPhoto);
        
        toast({
          title: "התמונה הועלתה בהצלחה",
          description: "התמונה נוספה לגלריה",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בהעלאת התמונה",
        description: "אירעה שגיאה בעת העלאת התמונה",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const categoryPhotos = photos.filter(photo => photo.category === category);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`upload-${category}`}
              disabled={isUploading}
            />
            <label htmlFor={`upload-${category}`}>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isUploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 ml-1" />
                  {isUploading ? 'מעלה...' : 'העלה תמונה'}
                </span>
              </Button>
            </label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categoryPhotos.length === 0 ? (
          <div className="text-center py-8">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">אין תמונות בקטגוריה זו</p>
            <p className="text-sm text-gray-400 mt-1">לחץ על "העלה תמונה" כדי להוסיף תמונות</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={`${title} - תמונה`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onPhotoDelete(photo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoGalleryManager;
