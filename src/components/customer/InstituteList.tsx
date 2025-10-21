
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, User, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InstitutePreviewModal } from './InstitutePreviewModal';
import { dbOperations } from '@/lib/database';

interface Therapist {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  image: string;
}

interface Institute {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  therapists: Therapist[];
  hours: string;
  coordinates: { lat: number; lng: number };
  image_url?: string; // Add optional image_url field for institute profile picture
  latitude?: number; // Make coordinates optional for institutes without them
  longitude?: number;
}

interface InstituteListProps {
  institutes: Institute[];
  selectedInstitute: string | null;
  onBookAppointment: (instituteId: string) => void;
}

const InstituteList = ({ institutes, selectedInstitute, onBookAppointment }: InstituteListProps) => {
  const [previewInstitute, setPreviewInstitute] = useState<Institute | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [instituteImages, setInstituteImages] = useState<{[key: string]: string}>({});

  const handlePreview = (institute: Institute) => {
    setPreviewInstitute(institute);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewInstitute(null);
  };

  // Load institute images that need to be fetched from API
  useEffect(() => {
    const loadInstituteImages = async () => {
      const imagesToLoad: string[] = [];

      institutes.forEach(institute => {
        if (institute.image_url && institute.image_url.includes('/.netlify/functions/image-upload') && !instituteImages[institute.id]) {
          imagesToLoad.push(institute.id);
        }
      });

      for (const instituteId of imagesToLoad) {
        try {
          const imageData = await dbOperations.getImage('institutes', instituteId);
          if (imageData) {
            setInstituteImages(prev => ({
              ...prev,
              [instituteId]: `data:image/jpeg;base64,${imageData}`
            }));
          }
        } catch (error) {
          console.log(`Failed to load image for institute ${instituteId}:`, error);
          // Keep placeholder for failed loads
        }
      }
    };

    if (institutes.length > 0) {
      loadInstituteImages();
    }
  }, [institutes, instituteImages]);

  if (institutes.length === 0) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-xl text-gray-500">לא נמצאו מכונים מתאימים לחיפוש שלך.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {institutes.map(institute => (
        <Card
          key={institute.id}
          id={`institute-${institute.id}`}
          className={`overflow-hidden transition-all ${selectedInstitute === institute.id ? 'ring-2 ring-primary' : ''}`}
          dir="rtl"
        >
          <CardContent className="p-0">
            <div className="flex">
              {/* Institute Profile Picture - Right Side for RTL */}
              <div className="w-32 h-32 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                <img
                  src={
                    instituteImages[institute.id] || // Use loaded binary image data
                    (institute.image_url && !institute.image_url.includes('/.netlify/functions/') ? institute.image_url : "/placeholder.svg") // Use direct URL or placeholder
                  }
                  alt={`${institute.name} - תמונת פרופיל`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/placeholder.svg") {
                      target.src = "/placeholder.svg";
                    }
                  }}
                />
              </div>

              {/* Institute Content - Left Side for RTL */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div className="text-right">
                    <h3 className="text-xl font-semibold">{institute.name}</h3>
                    <div className="flex items-center justify-end mt-1 text-sm text-gray-600">
                      <span>
                        {institute.distance > 0
                          ? `${institute.distance} ק"מ ממך`
                          : 'מרחק לא זמין'
                        }
                      </span>
                      <span className="mx-2">•</span>
                      {institute.address}
                      <MapPin className="h-4 w-4 mr-1" />
                    </div>
                  </div>
                  <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
                    <span className="text-xs text-gray-500 ml-1">({institute.reviewCount})</span>
                    <span className="font-medium">
                      {institute.reviewCount > 0 ? institute.rating.toFixed(2) : 'אין דירוג'}
                    </span>
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  </div>
                </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2 text-right">מטפלים:</h4>
                <div className="flex flex-wrap gap-4 justify-end">
                  {institute.therapists.map(therapist => (
                    <div key={therapist.id} className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden ml-2 bg-gray-200">
                        <img
                          src={therapist.image}
                          alt={therapist.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-full h-full flex items-center justify-center hidden">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{therapist.name}</p>
                        <p className="text-sm text-gray-600">{therapist.specialty}, {therapist.experience} שנות ניסיון</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-end text-sm text-gray-600">
                <span>{institute.hours}</span>
                <Clock className="h-4 w-4 mr-1" />
              </div>

                <div className="mt-6 flex justify-start gap-3">
                  <Button
                    onClick={() => onBookAppointment(institute.id)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    הזמן תור
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePreview(institute)}
                    className="gap-2"
                  >
                    תצוגה מקדימה
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <InstitutePreviewModal
        institute={previewInstitute}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default InstituteList;
