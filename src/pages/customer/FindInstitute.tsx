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
// Address suggestions now come from database institute addresses
import { dbOperations, Institute as DBInstitute } from '@/lib/database';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Interface for institutes
interface Institute {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  therapists: Array<{
    id: number;
    name: string;
    specialty: string;
    experience: number;
    image: string;
  }>;
  hours: string;
  coordinates: { lat: number; lng: number };
}

const FindInstitute = () => {
  const { isAuthenticated, user } = useAuth();
  const { selectedMapLocation, setSelectedMapLocation, userClub } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userLocation } = useLocation();
  
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [allInstitutes, setAllInstitutes] = useState<any[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load institutes from database
  useEffect(() => {
    const loadInstitutes = async () => {
      try {
        const dbInstitutes = await dbOperations.getInstitutes();
        
        // Transform database institutes to match the expected interface
        const transformedInstitutes = await Promise.all(
          dbInstitutes.map(async (institute, index) => {
            // Get therapists for this institute
            const therapists = await dbOperations.getTherapistsByInstitute(institute.id);
            
            // Get real ratings and coordinates
            const [ratings, coordinates] = await Promise.all([
              dbOperations.getReviewsByInstitute(institute.id).then(reviews => ({
                average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4.5,
                count: reviews.length
              })),
              dbOperations.getServicesByInstitute(institute.id).then(() => ({
                lat: 32.0853 + (Math.random() - 0.5) * 0.1, // Still using random for now
                lng: 34.7818 + (Math.random() - 0.5) * 0.1
              }))
            ]);

            return {
              id: institute.id,
              name: institute.institute_name,
              address: institute.address || 'כתובת לא זמינה',
              distance: Math.random() * 10 + 1, // Could be calculated from real coordinates
              rating: Math.round(ratings.average * 10) / 10,
              reviewCount: ratings.count,
              therapists: therapists.map(therapist => ({
                id: therapist.id,
                name: therapist.name,
                specialty: therapist.bio || 'מטפל מוסמך',
                experience: parseInt(therapist.experience?.split(' ')[0] || '5'),
                image: therapist.image_url || '/placeholder.svg'
              })),
              hours: 'א-ה: 8:00-20:00, ו: 8:00-14:00', // Could load from business_hours table
              coordinates: coordinates
            };
          })
        );

        setAllInstitutes(transformedInstitutes);
        setInstitutes(transformedInstitutes);
      } catch (error) {
        console.error('Error loading institutes:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את רשימת המכונים",
          variant: "destructive",
        });
      }
    };

    loadInstitutes();
  }, [toast]);
  
  // Appointment booking state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [bookingInstitute, setBookingInstitute] = useState<Institute | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/find-institute' } });
    }
  }, [isAuthenticated, navigate]);
  
  // If we have a selected location from another screen, use it
  useEffect(() => {
    if (selectedMapLocation) {
      // Find the closest institute to the selected location
      const closest = allInstitutes.reduce((prev, curr) => {
        const prevDist = Math.sqrt(
          Math.pow(prev.coordinates.lat - selectedMapLocation.lat, 2) + 
          Math.pow(prev.coordinates.lng - selectedMapLocation.lng, 2)
        );
        
        const currDist = Math.sqrt(
          Math.pow(curr.coordinates.lat - selectedMapLocation.lat, 2) + 
          Math.pow(curr.coordinates.lng - selectedMapLocation.lng, 2)
        );
        
        return prevDist < currDist ? prev : curr;
      });
      
      setSelectedInstitute(closest.id);
      setActiveView('list');
      
      // Clear the selected location after using it
      setSelectedMapLocation(null);
      
      // Scroll to the selected institute
      setTimeout(() => {
        const element = document.getElementById(`institute-${closest.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [selectedMapLocation, setSelectedMapLocation]);

  // Handle search input changes
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    
    // Filter suggestions based on real institute addresses
    if (query.length > 0) {
      const addressSuggestions = allInstitutes
        .map(institute => institute.address)
        .filter(address => address.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(addressSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    
    // Filter institutes based on the selected suggestion
    const filtered = allInstitutes.filter(institute =>
      institute.address.toLowerCase().includes(suggestion.toLowerCase())
    );
    setInstitutes(filtered.length > 0 ? filtered : allInstitutes);
  };

  const { confirmedAppointments, updateUserClubPoints, addNewAppointment } = useData();

  const handleBookAppointment = async (instituteId: string) => {
    const institute = allInstitutes.find(inst => inst.id === instituteId);
    if (institute) {
      console.log('Booking appointment for institute:', institute.name);
      console.log('Current therapists:', institute.therapists.map(t => t.name));
      
      // Fetch fresh therapists to ensure we have the correct data
      try {
        const dbInstitutes = await dbOperations.getInstitutes();
        const originalInstitute = dbInstitutes.find(dbInst => 
          dbInst.id === instituteId
        );
        
        if (originalInstitute) {
          const freshTherapists = await dbOperations.getTherapistsByInstitute(originalInstitute.id);
          console.log('Fresh therapists fetched:', freshTherapists.map(t => t.name));
          
          // Create updated institute with fresh therapist data
          const updatedInstitute = {
            ...institute,
            therapists: freshTherapists.map(therapist => ({
              id: therapist.id,
              name: therapist.name,
              specialty: therapist.bio || 'מטפל מוסמך',
              experience: parseInt(therapist.experience?.split(' ')[0] || '5'),
              image: therapist.image_url || '/placeholder.svg'
            }))
          };
          
          setBookingInstitute(updatedInstitute);
        } else {
          setBookingInstitute(institute);
        }
      } catch (error) {
        console.error('Error fetching fresh therapists:', error);
        setBookingInstitute(institute);
      }
      
      setIsBookingDialogOpen(true);
    }
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !selectedTherapist || !bookingInstitute || !user) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
      });
      return;
    }
    
    try {
      // Format date for database (YYYY-MM-DD)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const displayDate = format(selectedDate, 'dd/MM/yyyy', { locale: he });
      
      // Create appointment in database
      const appointmentData = {
        user_id: user.id,
        institute_id: bookingInstitute.id,
        service_name: selectedService,
        appointment_date: formattedDate,
        appointment_time: selectedTime,
        status: 'pending',
        price: selectedService.includes('קצר') ? 150 : 250 // Example pricing
      };
      
      console.log('Creating appointment in database:', appointmentData);
      const dbAppointment = await dbOperations.createAppointment(appointmentData);
      
      // Create local appointment object for immediate UI update
      const newAppointment = {
        id: dbAppointment.id,
        therapistName: selectedTherapist,
        service: selectedService,
        date: displayDate,
        time: selectedTime,
        duration: selectedService.includes('קצר') ? '30 דקות' : '60 דקות',
        phone: user.phone || '050-0000000',
        institute: bookingInstitute.name
      };
      
      // Add the appointment to local state
      addNewAppointment(newAppointment);
      
      // Add points to user club (50 points per appointment)
      updateUserClubPoints(50);
      
      // Close dialog and show toast
      setIsBookingDialogOpen(false);
      
      toast({
        title: "התור נקבע בהצלחה",
        description: `נקבע תור ב${bookingInstitute.name} עם ${selectedTherapist} לתאריך ${displayDate}, שעה ${selectedTime}`,
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedService('');
      setSelectedTherapist('');
      setBookingInstitute(null);
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת התור",
        description: "לא ניתן לקבוע את התור. אנא נסה שוב מאוחר יותר.",
      });
    }
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

  // Create enhanced markers with additional institute details
  const enhancedMarkers = filteredInstitutes.map(institute => ({
    id: institute.id,
    name: institute.name,
    coordinates: institute.coordinates,
    address: institute.address,
    rating: institute.rating,
    hours: institute.hours,
    therapists: institute.therapists.map(t => ({
      name: t.name,
      specialty: t.specialty,
      experience: t.experience
    }))
  }));
  
  // Generate available times for booking
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];
  
  // Updated services for booking with the new treatment types
  const services = [
    'טיפול סטנדרטי',
    'טיפול ספורטאים',
    'טיפול שיקום',
    'טיפול קצר'
  ];

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
                  userLocation={userLocation || { lat: 31.4117, lng: 35.0818 }} // Default to Israel's center if no user location
                  markers={enhancedMarkers}
                  onMarkerClick={handleMarkerClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>הזמנת תור</DialogTitle>
            <DialogDescription>
              {bookingInstitute && `הזמנת תור במכון ${bookingInstitute.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Date picker */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">בחר תאריך</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={!selectedDate ? "text-muted-foreground" : ""}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: he }) : "בחר תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={he}
                    disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 2))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time picker */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">בחר שעה</label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר שעה" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Service type */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">סוג טיפול</label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג טיפול" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Therapist selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">בחר מטפל</label>
              <Select
                value={selectedTherapist}
                onValueChange={setSelectedTherapist}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטפל" />
                </SelectTrigger>
                <SelectContent>
                  {bookingInstitute?.therapists.map((therapist) => (
                    <SelectItem key={therapist.id} value={therapist.name}>
                      {therapist.name} - {therapist.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Club points information */}
            <div className="bg-green-50 p-3 rounded-md mt-2">
              <p className="text-sm text-green-800">
                הזמנת תור תזכה אותך ב-50 נקודות מועדון!
              </p>
              <p className="text-xs text-green-700 mt-1">
                יתרה נוכחית: {userClub.points} נקודות
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleConfirmBooking}>אשר הזמנה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default FindInstitute;
