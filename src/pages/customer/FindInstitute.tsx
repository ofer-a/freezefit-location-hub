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
import { CalendarIcon, Clock, Loader2, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

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
  image_url?: string; // Add optional image_url field for institute profile picture
}

const FindInstitute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [instituteServices, setInstituteServices] = useState<{[key: string]: any[]}>({});
  const [instituteBusinessHours, setInstituteBusinessHours] = useState<{[key: string]: any[]}>({});

  // Load services for a specific institute
  const loadInstituteServices = async (instituteId: string) => {
    try {
      if (instituteServices[instituteId]) {
        return instituteServices[instituteId]; // Return cached services
      }
      
      const services = await dbOperations.getServicesByInstitute(instituteId);
      const transformedServices = services.map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration
      }));
      
      setInstituteServices(prev => ({
        ...prev,
        [instituteId]: transformedServices
      }));
      
      return transformedServices;
    } catch (error) {
      console.error('Error loading institute services:', error);
      return [];
    }
  };

  // Load business hours for a specific institute
  const loadInstituteBusinessHours = async (instituteId: string) => {
    try {
      if (instituteBusinessHours[instituteId]) {
        return instituteBusinessHours[instituteId]; // Return cached business hours
      }
      
      const businessHours = await dbOperations.getBusinessHoursByInstitute(instituteId);
      
      setInstituteBusinessHours(prev => ({
        ...prev,
        [instituteId]: businessHours
      }));
      
      return businessHours;
    } catch (error) {
      console.error('Error loading institute business hours:', error);
      return [];
    }
  };

  // Helper function to get business hours for a specific day
  const getBusinessHoursForDay = (businessHours: any[], dayOfWeek: number) => {
    return businessHours.find((bh: any) => bh.day_of_week === dayOfWeek);
  };

  // Load institutes from database with single optimized API call
  useEffect(() => {
    const loadInstitutes = async () => {
      try {
        setLoading(true);
        setLoadingProgress(20);
        
        // Single API call to get all institute data with aggregated information
        const detailedInstitutes = await dbOperations.getInstitutesDetailed();
        setLoadingProgress(80);
        
        if (detailedInstitutes.length === 0) {
          setLoading(false);
          return;
        }

        // Transform the aggregated data
        const transformedInstitutes = detailedInstitutes.map((institute, index) => {
          // Check if institute has real coordinates (not null)
          const hasRealCoordinates = institute.latitude !== null && institute.longitude !== null;
          const coordinates = hasRealCoordinates
            ? { lat: institute.latitude, lng: institute.longitude }
            : { lat: 32.0853, lng: 34.7818 }; // Default to Tel Aviv if no coordinates

          // Calculate accurate distance using Haversine formula (only if institute has real coordinates)
          const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
            const R = 6371; // Radius of the Earth in kilometers
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in kilometers
          };

          const distance = (userLocation && hasRealCoordinates)
            ? Number(calculateDistance(userLocation.lat, userLocation.lng, coordinates.lat, coordinates.lng).toFixed(2))
            : 0; // Show 0 if no user location or no real institute coordinates
          
          // Debug logging
          console.log(`Institute: ${institute.institute_name}, User Location: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'null'}, Institute Coords: ${coordinates.lat}, ${coordinates.lng}, Distance: ${distance}km`);

          // Format business hours from aggregated data
          const formatBusinessHours = (hours: any[]) => {
            if (!hours || hours.length === 0) return 'שעות פתיחה: יש ליצור קשר';
            
            const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
            const workingDays = hours.filter(h => h.is_open);
            
            if (workingDays.length === 0) return 'סגור';
            
            const groups: any[] = [];
            workingDays.forEach(day => {
              const timeStr = `${day.open_time}-${day.close_time}`;
              const existing = groups.find(g => g.time === timeStr);
              if (existing) {
                existing.days.push(day.day_of_week);
              } else {
                groups.push({ time: timeStr, days: [day.day_of_week] });
              }
            });
            
            return groups.map(group => {
              const sortedDays = group.days.sort();
              const dayRange = sortedDays.length > 2 && 
                sortedDays.every((day: number, i: number) => i === 0 || day === sortedDays[i-1] + 1)
                ? `${dayNames[sortedDays[0]]}-${dayNames[sortedDays[sortedDays.length - 1]]}`
                : sortedDays.map((d: number) => dayNames[d]).join(',');
              return `${dayRange}: ${group.time}`;
            }).join(', ');
          };

          // Handle institute image - use image_data if available, otherwise use image_url
          const instituteImageData = institute.image_data;
          const instituteMimeType = institute.image_mime_type || 'image/jpeg';
          const instituteImage = instituteImageData && instituteImageData !== 'null'
            ? `data:${instituteMimeType};base64,${instituteImageData}`
            : (institute.image_url || '/placeholder.svg');

          return {
            id: institute.id,
            name: institute.institute_name,
            address: institute.address || 'כתובת לא זמינה',
            distance,
            rating: institute.average_rating ? parseFloat(institute.average_rating.toFixed(2)) : 0,
            reviewCount: institute.review_count,
            image_url: instituteImage,
            therapists: (institute.therapists || []).map((therapist: any) => {
              const imageUrl = therapist.image_url || '/placeholder.svg';
              const imageData = therapist.image_data;
              const mimeType = therapist.image_mime_type || 'image/jpeg';


              // Use image_data if available, otherwise use image_url
              const image = imageData && imageData !== 'null'
                ? `data:image/jpeg;base64,${imageData}`
                : imageUrl;

              return {
                id: therapist.id,
                name: therapist.name,
                specialty: therapist.bio || 'מטפל מוסמך',
                experience: parseInt(therapist.experience?.split(' ')[0] || '5'),
                image: image
              };
            }),
            hours: formatBusinessHours(institute.business_hours || []),
            coordinates,
            latitude: hasRealCoordinates ? institute.latitude : null,
            longitude: hasRealCoordinates ? institute.longitude : null
          };
        });

        // Sort institutes by distance (closest first)
        const sortedInstitutes = transformedInstitutes.sort((a, b) => a.distance - b.distance);

        console.log(`Loaded ${sortedInstitutes.length} institutes with coordinates out of ${detailedInstitutes.length} total institutes`);

        // Show all institutes in the list, even those without coordinates
        setAllInstitutes(sortedInstitutes);
        setInstitutes(sortedInstitutes);
        setLoadingProgress(100);
        setLoading(false);
      } catch (error) {
        console.error('Error loading institutes:', error);
        setLoading(false);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את רשימת המכונים",
          variant: "destructive",
        });
      }
    };

    loadInstitutes();
  }, [toast, userLocation]);
  
  // Appointment booking state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<{id: string; name: string} | null>(null);
  const [bookingInstitute, setBookingInstitute] = useState<Institute | null>(null);

  // Handler for therapist selection that parses the JSON string
  const handleTherapistChange = (value: string) => {
    try {
      const therapistObj = JSON.parse(value);
      setSelectedTherapist(therapistObj);
    } catch (error) {
      console.error('Error parsing therapist selection:', error);
      setSelectedTherapist(null);
    }
  };

  // Check authentication
  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/find-institute' } });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
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
      
      // Fetch fresh therapists and services to ensure we have the correct data
      try {
        const dbInstitutes = await dbOperations.getInstitutes();
        const originalInstitute = dbInstitutes.find(dbInst => 
          dbInst.id === instituteId
        );
        
        if (originalInstitute) {
          const [freshTherapists, freshServices, freshBusinessHours] = await Promise.all([
            dbOperations.getTherapistsByInstitute(originalInstitute.id, false), // Only active therapists
            loadInstituteServices(originalInstitute.id),
            loadInstituteBusinessHours(originalInstitute.id)
          ]);
          
          console.log('Fresh therapists fetched:', freshTherapists.map(t => t.name));
          console.log('Fresh services fetched:', freshServices.map(s => s.name));
          console.log('Fresh business hours fetched:', freshBusinessHours);
          
          // Create updated institute with fresh therapist and service data
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
    if (!selectedDate || !selectedTime || !selectedService || !bookingInstitute || !user) {
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
      
      // Get the selected service details to get the correct price
      const selectedServiceData = bookingInstitute && instituteServices[bookingInstitute.id] 
        ? instituteServices[bookingInstitute.id].find(service => service.name === selectedService)
        : null;
      
      const servicePrice = selectedServiceData ? selectedServiceData.price : (selectedService.includes('קצר') ? 150 : 250);
      const serviceDuration = selectedServiceData ? selectedServiceData.duration : (selectedService.includes('קצר') ? '30 דקות' : '60 דקות');
      
      // Create appointment in database
      const appointmentData = {
        user_id: user.id,
        institute_id: bookingInstitute.id,
        therapist_id: selectedTherapist?.id || null,
        therapist_name: selectedTherapist?.name || null,
        institute_name: bookingInstitute.name,
        service_name: selectedService,
        appointment_date: formattedDate,
        appointment_time: selectedTime,
        status: 'pending' as const,
        price: servicePrice
      };
      
      console.log('Creating appointment in database:', appointmentData);
      const dbAppointment = await dbOperations.createAppointment(appointmentData);
      
      // Create activity record
      await dbOperations.createActivity({
        institute_id: bookingInstitute.id,
        user_id: user.id,
        activity_type: 'appointment',
        title: `תור חדש נקבע - ${selectedService}`,
        description: `${user.name} קבע תור ל${selectedService} בתאריך ${displayDate} בשעה ${selectedTime}`,
        reference_id: dbAppointment.id
      });
      
      // Create local appointment object for immediate UI update
      const newAppointment = {
        id: dbAppointment.id,
        therapistName: selectedTherapist?.name || null,
        service: selectedService,
        date: displayDate,
        time: selectedTime,
        duration: serviceDuration,
        phone: '050-0000000', // Default phone - user phone would come from extended profile
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
        description: `נקבע תור ב${bookingInstitute.name} עם ${selectedTherapist?.name || 'מטפל לא ידוע'} לתאריך ${displayDate}, שעה ${selectedTime}`,
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedService('');
      setSelectedTherapist(null);
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

  const handleMarkerClick = (instituteId: string) => {
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

  // Create enhanced markers with additional institute details (only for institutes with real coordinates)
  const enhancedMarkers = filteredInstitutes
    .filter(institute => institute.latitude !== null && institute.longitude !== null)
    .map(institute => ({
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
  
  // Generate available times for booking based on business hours
  const getAvailableTimes = (selectedDate: Date | undefined, instituteId: string) => {
    if (!selectedDate || !instituteBusinessHours[instituteId]) {
      // Fallback to default times if no business hours data
      return [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
      ];
    }

    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const businessHours = instituteBusinessHours[instituteId];
    
    // Get the most recent business hours for this day
    const dayBusinessHours = getBusinessHoursForDay(businessHours, dayOfWeek);

    if (!dayBusinessHours || !dayBusinessHours.is_open) {
      return []; // Institute is closed on this day
    }

    // Generate times based on business hours
    const openTime = dayBusinessHours.open_time;
    const closeTime = dayBusinessHours.close_time;
    
    if (!openTime || !closeTime) {
      return []; // No valid business hours
    }

    const times = [];
    const openHour = parseInt(openTime.split(':')[0]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    
    for (let hour = openHour; hour < closeHour; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    return times;
  };

  // Check if a date is available for booking
  const isDateAvailable = (date: Date, instituteId: string) => {
    if (!instituteBusinessHours[instituteId]) {
      return true; // If no business hours data, allow all dates
    }

    const dayOfWeek = date.getDay();
    const businessHours = instituteBusinessHours[instituteId];
    
    // Get the most recent business hours for this day
    const dayBusinessHours = getBusinessHoursForDay(businessHours, dayOfWeek);

    return dayBusinessHours && dayBusinessHours.is_open;
  };
  
  // Updated services for booking with the new treatment types
  const services = [
    'טיפול סטנדרטי',
    'טיפול ספורטאים',
    'טיפול שיקום',
    'טיפול קצר'
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72 mb-1" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          
          <div className="mb-4">
            <Skeleton className="h-5 w-16 mb-2" />
            <div className="flex gap-4">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-2" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </div>
          
          <Skeleton className="h-4 w-40 mb-4" />
          
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">בודק הרשאות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center" dir="rtl">מצא מכון טיפול</h1>
          
          {/* Loading progress indicator */}
          {loading && (
            <div className="mb-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2 justify-center">
                <span className="text-sm text-gray-600">טוען מכונים...</span>
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <Progress value={loadingProgress} className="w-full" />
            </div>
          )}
          
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
                {loading && filteredInstitutes.length === 0 ? (
                  <LoadingSkeleton />
                ) : (
                  <InstituteList 
                    institutes={filteredInstitutes}
                    selectedInstitute={selectedInstitute}
                    onBookAppointment={handleBookAppointment}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="map" className="mt-6">
                {enhancedMarkers.length > 0 ? (
                  <MapComponent
                    userLocation={userLocation || { lat: 31.4117, lng: 35.0818 }} // Default to Israel's center if no user location
                    markers={enhancedMarkers}
                    onMarkerClick={handleMarkerClick}
                  />
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      מפה זמינה בקרוב
                    </h3>
                    <p className="text-blue-600">
                      אנו עובדים על הוספת מיקומי המכונים למפה. בינתיים תוכל למצוא מכונים ברשימה למעלה.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>הזמנת תור</DialogTitle>
            <DialogDescription>
              {bookingInstitute && (
                <div className="text-right">
                  <p>הזמנת תור במכון {bookingInstitute.name}</p>
                  {instituteBusinessHours[bookingInstitute.id] && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium text-right">שעות פעילות:</p>
                      {instituteBusinessHours[bookingInstitute.id].map((bh: any, index: number) => {
                        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                        return (
                          <p key={index} className="text-xs text-right">
                            {dayNames[bh.day_of_week]}: {bh.is_open ? `${bh.open_time} - ${bh.close_time}` : 'סגור'}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Date picker */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-right">בחר תאריך</label>
              {bookingInstitute && instituteBusinessHours[bookingInstitute.id] && (
                <p className="text-xs text-gray-500 text-right">
                  ימים אפורים = המכון סגור
                </p>
              )}
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
                    onSelect={(date) => {
                      setSelectedDate(date);
                      // Reset selected time when date changes
                      setSelectedTime('');
                    }}
                    initialFocus
                    locale={he}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 2);
                      
                      // Disable past dates and dates beyond 2 months
                      if (date < today || date > maxDate) {
                        return true;
                      }
                      
                      // Disable dates when institute is closed
                      if (bookingInstitute && !isDateAvailable(date, bookingInstitute.id)) {
                        return true;
                      }
                      
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time picker */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-right">בחר שעה</label>
              {selectedDate && bookingInstitute && !isDateAvailable(selectedDate, bookingInstitute.id) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ המכון סגור בתאריך זה
                  </p>
                </div>
              )}
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר שעה" />
                </SelectTrigger>
                <SelectContent>
                  {bookingInstitute ? (
                    getAvailableTimes(selectedDate, bookingInstitute.id).length > 0 ? (
                      getAvailableTimes(selectedDate, bookingInstitute.id).map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        המכון סגור בתאריך זה
                      </div>
                    )
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      בחר תאריך תחילה
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Service type */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-right">סוג טיפול</label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג טיפול" />
                </SelectTrigger>
                <SelectContent>
                  {bookingInstitute && instituteServices[bookingInstitute.id] ? (
                    instituteServices[bookingInstitute.id].map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} - ₪{service.price} ({service.duration})
                      </SelectItem>
                    ))
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Therapist selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-right">בחר מטפל</label>
              <Select
                value={selectedTherapist ? JSON.stringify(selectedTherapist) : ''}
                onValueChange={handleTherapistChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטפל" />
                </SelectTrigger>
                <SelectContent>
                  {bookingInstitute?.therapists.map((therapist) => (
                    <SelectItem key={therapist.id} value={JSON.stringify({id: therapist.id, name: therapist.name})}>
                      {therapist.name} - {therapist.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Club points information */}
            <div className="bg-green-50 p-3 rounded-md mt-2">
              <p className="text-sm text-green-800 text-right">
                הזמנת תור תזכה אותך ב-50 נקודות מועדון!
              </p>
              <p className="text-xs text-green-700 mt-1 text-right">
                יתרה נוכחית: {userClub.points} נקודות
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleConfirmBooking}>אשר הזמנה</Button>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>ביטול</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default FindInstitute;
