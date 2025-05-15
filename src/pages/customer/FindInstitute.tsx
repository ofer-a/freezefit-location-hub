
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MapPin, Star, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MapComponent from '@/components/map/MapComponent';

// Mock data for institutes
const mockInstitutes = [
  {
    id: 1,
    name: 'מרכז קריוסטיים',
    address: 'רחוב הרצל 15, תל אביב',
    distance: 2.3,
    rating: 4.8,
    reviewCount: 124,
    therapists: [
      { id: 1, name: 'דני כהן', specialty: 'ספורטאים', experience: 5, image: '/placeholder.svg' },
      { id: 2, name: 'מיכל לוי', specialty: 'שיקום', experience: 8, image: '/placeholder.svg' }
    ],
    hours: 'א-ה: 8:00-20:00, ו: 8:00-14:00',
    coordinates: { lat: 32.0853, lng: 34.7818 }
  },
  {
    id: 2,
    name: 'קריו פלוס',
    address: 'דרך מנחם בגין 132, תל אביב',
    distance: 3.6,
    rating: 4.6,
    reviewCount: 89,
    therapists: [
      { id: 3, name: 'רונית דוד', specialty: 'קריותרפיה', experience: 10, image: '/placeholder.svg' },
    ],
    hours: 'א-ה: 7:00-21:00, ו: 8:00-13:00, ש: 10:00-14:00',
    coordinates: { lat: 32.0733, lng: 34.7913 }
  },
  {
    id: 3,
    name: 'אייס פיט',
    address: 'רחוב אבן גבירול 30, תל אביב',
    distance: 5.1,
    rating: 4.7,
    reviewCount: 56,
    therapists: [
      { id: 4, name: 'אלון ברק', specialty: 'ספורטאי עילית', experience: 7, image: '/placeholder.svg' },
      { id: 5, name: 'נועה פרץ', specialty: 'שחזור שריר', experience: 6, image: '/placeholder.svg' }
    ],
    hours: 'א-ה: 9:00-22:00, ו-ש: 10:00-15:00',
    coordinates: { lat: 32.0873, lng: 34.7733 }
  }
];

// Mock city/address suggestions
const mockSuggestions = [
  'תל אביב, אבן גבירול 30',
  'תל אביב, הרצל 15',
  'תל אביב, מנחם בגין 132',
  'ירושלים, יפו 97',
  'חיפה, הנמל 11',
  'רמת גן, ביאליק 76'
];

const FindInstitute = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [institutes, setInstitutes] = useState(mockInstitutes);
  const [selectedInstitute, setSelectedInstitute] = useState<number | null>(null);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/find-institute' } });
    }
  }, [isAuthenticated, navigate]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            variant: "destructive",
            title: "שגיאה במיקום",
            description: "לא הצלחנו לאתר את המיקום שלך. ודא שאפשרת גישה למיקום.",
          });
          // Set default location (Tel Aviv)
          setUserLocation({ lat: 32.0853, lng: 34.7818 });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "מיקום לא נתמך",
        description: "הדפדפן שלך לא תומך בשירותי מיקום.",
      });
      // Set default location (Tel Aviv)
      setUserLocation({ lat: 32.0853, lng: 34.7818 });
    }
  }, [toast]);

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Filter suggestions based on input
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    
    // Filter institutes based on the selected suggestion
    const filtered = mockInstitutes.filter(institute =>
      institute.address.toLowerCase().includes(suggestion.toLowerCase())
    );
    setInstitutes(filtered.length > 0 ? filtered : mockInstitutes);
  };

  const handleBookAppointment = (instituteId: number) => {
    toast({
      title: "הזמנת תור",
      description: "הועברת למסך הזמנת תור במרכז הנבחר",
    });
    // In a real app, navigate to booking page
    console.log("Booking appointment at institute:", instituteId);
  };

  const handleMarkerClick = (instituteId: number) => {
    setSelectedInstitute(instituteId);
    setActiveView('list');
    
    // Scroll to the selected institute
    setTimeout(() => {
      const element = document.getElementById(`institute-${instituteId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const filteredInstitutes = searchQuery
    ? institutes.filter(institute =>
        institute.name.includes(searchQuery) ||
        institute.address.includes(searchQuery)
      )
    : institutes;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">מצא מכון טיפול</h1>
          
          {/* Search bar with suggestions */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="חפש לפי שם או כתובת..."
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-freezefit-300"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* View toggle */}
          <div className="max-w-4xl mx-auto mb-6">
            <Tabs 
              defaultValue="list" 
              className="w-full"
              onValueChange={setActiveView}
              value={activeView}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">רשימה</TabsTrigger>
                <TabsTrigger value="map">מפה</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-6">
                {filteredInstitutes.length > 0 ? (
                  <div className="space-y-6">
                    {filteredInstitutes.map(institute => (
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
                                  <span>{institute.distance} ק"מ ממך</span>
                                </div>
                              </div>
                              <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
                                <Star className="h-4 w-4 text-yellow-500 ml-1" />
                                <span className="font-medium">{institute.rating}</span>
                                <span className="text-xs text-gray-500 mr-1">({institute.reviewCount})</span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">מטפלים:</h4>
                              <div className="flex flex-wrap gap-4">
                                {institute.therapists.map(therapist => (
                                  <div key={therapist.id} className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                      <User className="h-6 w-6 text-gray-500" />
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
                            
                            <div className="mt-6 flex justify-end">
                              <Button 
                                onClick={() => handleBookAppointment(institute.id)}
                                className="bg-primary hover:bg-primary/90 text-white"
                              >
                                הזמן תור
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500">לא נמצאו מכונים מתאימים לחיפוש שלך.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="map" className="mt-6">
                <MapComponent 
                  userLocation={userLocation}
                  markers={mockInstitutes}
                  onMarkerClick={handleMarkerClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FindInstitute;
