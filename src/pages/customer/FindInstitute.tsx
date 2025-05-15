
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MapComponent from '@/components/map/MapComponent';
import SearchBar from '@/components/customer/SearchBar';
import InstituteList from '@/components/customer/InstituteList';
import { useLocation } from '@/hooks/use-location';
import { mockInstitutes, mockSuggestions, Institute } from '@/data/mockInstitutes';

const FindInstitute = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userLocation } = useLocation();
  
  const [institutes, setInstitutes] = useState<Institute[]>(mockInstitutes);
  const [selectedInstitute, setSelectedInstitute] = useState<number | null>(null);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/find-institute' } });
    }
  }, [isAuthenticated, navigate]);

  // Handle search input changes
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    
    // Filter suggestions based on input
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    
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
          
          <SearchBar 
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchInputChange}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
          
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
                <InstituteList 
                  institutes={filteredInstitutes}
                  selectedInstitute={selectedInstitute}
                  onBookAppointment={handleBookAppointment}
                />
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
