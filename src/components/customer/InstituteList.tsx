
import React, { useState } from 'react';
import { MapPin, Star, Clock, User, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InstitutePreviewModal } from './InstitutePreviewModal';

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
}

interface InstituteListProps {
  institutes: Institute[];
  selectedInstitute: string | null;
  onBookAppointment: (instituteId: string) => void;
}

const InstituteList = ({ institutes, selectedInstitute, onBookAppointment }: InstituteListProps) => {
  const [previewInstitute, setPreviewInstitute] = useState<Institute | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (institute: Institute) => {
    setPreviewInstitute(institute);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewInstitute(null);
  };

  if (institutes.length === 0) {
    return (
      <div className="text-center py-12">
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
        >
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{institute.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 ml-1" />
                    {institute.address}
                    <span className="mx-2">•</span>
                    <span>
                      {institute.distance > 0 
                        ? `${institute.distance} ק"מ ממך` 
                        : 'מרחק לא זמין'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
                  <Star className="h-4 w-4 text-yellow-500 ml-1" />
                  <span className="font-medium">
                    {institute.reviewCount > 0 ? institute.rating.toFixed(2) : 'אין דירוג'}
                  </span>
                  <span className="text-xs text-gray-500 mr-1">({institute.reviewCount})</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">מטפלים:</h4>
                <div className="flex flex-wrap gap-4">
                  {institute.therapists.map(therapist => (
                    <div key={therapist.id} className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-2 bg-gray-200">
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
                      <div>
                        <p className="font-medium">{therapist.name}</p>
                        <p className="text-sm text-gray-600">{therapist.specialty}, {therapist.experience} שנות ניסיון</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 ml-1" />
                <span>{institute.hours}</span>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handlePreview(institute)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  תצוגה מקדימה
                </Button>
                <Button 
                  onClick={() => onBookAppointment(institute.id)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  הזמן תור
                </Button>
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
