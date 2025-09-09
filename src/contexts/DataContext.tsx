
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbOperations } from '@/lib/database';

// Define the data types
interface Appointment {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'נקבע' | 'הושלם' | 'בוטל' | 'ממתין לאישור שינוי';
  duration?: string;
  phone?: string;
  therapistName?: string;
  institute?: string;
  originalDate?: string;
  originalTime?: string;
  requestedDate?: string;
  requestedTime?: string;
}

interface Gift {
  id: number;
  name: string;
  pointsCost: number;
  image: string;
}

interface UserClub {
  level: string;
  points: number;
  nextLevelPoints: number;
  benefits: string[];
  availableGifts: Gift[];
}

interface ContactInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

interface MapLocation {
  lat: number;
  lng: number;
}

interface Review {
  id: string;
  customerName: string;
  customerId: string;
  instituteName: string;
  instituteId: number;
  therapistName: string;
  therapistId: number;
  rating: number;
  reviewText: string;
  isAnonymous: boolean;
  submittedAt: Date;
}

interface DataContextType {
  confirmedAppointments: Appointment[];
  historyAppointments: Appointment[];
  pendingAppointments: Appointment[];
  rescheduleRequests: Appointment[];
  updateAppointmentStatus: (appointmentId: number, currentStatus: string, newStatus: string) => void;
  requestReschedule: (appointmentId: number, newDate: string, newTime: string) => void;
  approveReschedule: (appointmentId: number) => void;
  declineReschedule: (appointmentId: number) => void;
  userClub: UserClub;
  redeemGift: (giftId: number) => void;
  updateUserClubPoints: (points: number) => void;
  addNewAppointment: (appointment: any) => void;
  contactInquiries: ContactInquiry[];
  addContactInquiry: (inquiry: ContactInquiry) => void;
  selectedMapLocation: MapLocation | null;
  setSelectedMapLocation: (location: MapLocation | null) => void;
  sendPasswordResetCode: (email: string) => Promise<string>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  reviews: Review[];
  addReview: (review: Review) => void;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the custom hook
const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for appointments - now loaded from real database
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);

  const [rescheduleRequests, setRescheduleRequests] = useState<Appointment[]>([]);

  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [selectedMapLocation, setSelectedMapLocation] = useState<MapLocation | null>(null);

  // Reviews state - now loaded from real database
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load data from database on component mount
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // For demo purposes, we'll use some sample user IDs from our database
        // In a real app, this would come from authentication context
        const sampleUserIds = [
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
          '33333333-3333-3333-3333-333333333333'
        ];

        // Load appointments for all sample users
        const allAppointments = [];
        for (const userId of sampleUserIds) {
          const userAppointments = await dbOperations.getAppointmentsByUser(userId);
          allAppointments.push(...userAppointments);
        }

        // Transform database appointments to match our interface
        const transformedAppointments = allAppointments.map(apt => ({
          id: parseInt(apt.id.split('-')[0], 16), // Convert UUID to number for compatibility
          customerName: apt.service_name, // Use service name for display
          service: apt.service_name,
          date: apt.appointment_date,
          time: apt.appointment_time,
          status: apt.status === 'confirmed' ? 'נקבע' as const :
                  apt.status === 'completed' ? 'הושלם' as const :
                  apt.status === 'cancelled' ? 'בוטל' as const :
                  'ממתין לאישור שינוי' as const,
          duration: '45 דקות', // Default duration
          phone: '050-1234567', // Default phone
          therapistName: apt.service_name // Use service name as therapist name for now
        }));

        // Separate appointments by status
        const confirmed = transformedAppointments.filter(apt => apt.status === 'נקבע');
        const pending = transformedAppointments.filter(apt => apt.status === 'ממתין לאישור שינוי');
        const history = transformedAppointments.filter(apt => apt.status === 'הושלם' || apt.status === 'בוטל');

        setConfirmedAppointments(confirmed);
        setPendingAppointments(pending);
        setHistoryAppointments(history);

      } catch (error) {
        console.error('Error loading appointments:', error);
        // Keep mock data as fallback for development
      }
    };

    const loadReviews = async () => {
      try {
        // Load reviews for all institutes
        const institutes = await dbOperations.getInstitutes();
        const allReviews = [];
        
        for (const institute of institutes) {
          const instituteReviews = await dbOperations.getReviewsByInstitute(institute.id);
          allReviews.push(...instituteReviews.map(review => ({
            id: review.id,
            customerName: review.user_name || 'לקוח אנונימי',
            customerId: review.user_id,
            instituteName: institute.institute_name,
            instituteId: parseInt(institute.id.split('-')[0], 16),
            therapistName: 'מטפל',
            therapistId: 1,
            rating: review.rating,
            reviewText: review.content,
            isAnonymous: !review.user_name,
            submittedAt: new Date(review.review_date || review.created_at)
          })));
        }

        setReviews(allReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    loadAppointments();
    loadReviews();
  }, []);

  // Add review function
  const addReview = (review: Review) => {
    setReviews(prev => [...prev, review]);
  };

  // Function to request appointment rescheduling
  const requestReschedule = (appointmentId: number, newDate: string, newTime: string) => {
    const appointment = confirmedAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      const rescheduleRequest = {
        ...appointment,
        originalDate: appointment.date,
        originalTime: appointment.time,
        requestedDate: newDate,
        requestedTime: newTime,
        status: 'ממתין לאישור שינוי' as const
      };
      
      setConfirmedAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      setRescheduleRequests(prev => [...prev, rescheduleRequest]);
    }
  };

  // Function to approve reschedule request
  const approveReschedule = (appointmentId: number) => {
    const rescheduleRequest = rescheduleRequests.find(apt => apt.id === appointmentId);
    if (rescheduleRequest && rescheduleRequest.requestedDate && rescheduleRequest.requestedTime) {
      const approvedAppointment = {
        ...rescheduleRequest,
        date: rescheduleRequest.requestedDate,
        time: rescheduleRequest.requestedTime,
        status: 'נקבע' as const,
        originalDate: undefined,
        originalTime: undefined,
        requestedDate: undefined,
        requestedTime: undefined
      };
      
      setRescheduleRequests(prev => prev.filter(apt => apt.id !== appointmentId));
      setConfirmedAppointments(prev => [...prev, approvedAppointment]);
    }
  };

  // Function to decline reschedule request
  const declineReschedule = (appointmentId: number) => {
    const rescheduleRequest = rescheduleRequests.find(apt => apt.id === appointmentId);
    if (rescheduleRequest && rescheduleRequest.originalDate && rescheduleRequest.originalTime) {
      const declinedAppointment = {
        ...rescheduleRequest,
        date: rescheduleRequest.originalDate,
        time: rescheduleRequest.originalTime,
        status: 'נקבע' as const,
        originalDate: undefined,
        originalTime: undefined,
        requestedDate: undefined,
        requestedTime: undefined
      };
      
      setRescheduleRequests(prev => prev.filter(apt => apt.id !== appointmentId));
      setConfirmedAppointments(prev => [...prev, declinedAppointment]);
    }
  };

  // Function to update appointment status
  const updateAppointmentStatus = (appointmentId: number, currentStatus: string, newStatus: string) => {
    const statusMap: { [key: string]: 'נקבע' | 'הושלם' | 'בוטל' } = {
      'pending': 'נקבע',
      'confirmed': 'נקבע',
      'completed': 'הושלם',
      'cancelled': 'בוטל'
    };

    const mappedNewStatus = statusMap[newStatus] || newStatus as 'נקבע' | 'הושלם' | 'בוטל';

    if (currentStatus === 'pending') {
      const appointment = pendingAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        
        if (newStatus === 'confirmed') {
          setConfirmedAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
        } else if (newStatus === 'cancelled') {
          // Deduct points when appointment is cancelled (50 points that were added during booking)
          setUserClub(prevClub => ({
            ...prevClub,
            points: Math.max(0, prevClub.points - 50) // Ensure points don't go below 0
          }));
          setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
        } else {
          setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
        }
      }
    } else if (currentStatus === 'confirmed') {
      const appointment = confirmedAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setConfirmedAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        
        if (newStatus === 'cancelled') {
          // Deduct points when confirmed appointment is cancelled
          setUserClub(prevClub => ({
            ...prevClub,
            points: Math.max(0, prevClub.points - 50) // Ensure points don't go below 0
          }));
        }
        
        setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
      }
    }
  };

  // User club data with updated gift images
  const [userClub, setUserClub] = useState({
    level: 'זהב',
    points: 850,
    nextLevelPoints: 1000,
    benefits: [
      'הנחה של 15% על כל הטיפולים',
      'עדיפות בהזמנת תורים',
      'גישה למבצעים בלעדיים',
      'נקודות בונוס על כל טיפול'
    ],
    availableGifts: [
      {
        id: 1,
        name: 'טיפול מתנה',
        pointsCost: 200,
        image: '/lovable-uploads/a1b8497e-3684-42ea-9ad8-69ff9ff062d1.png'
      },
      {
        id: 2,
        name: 'חולצת מותג',
        pointsCost: 350,
        image: '/lovable-uploads/e8aa38a8-789a-4462-813f-069777b952bb.png'
      },
      {
        id: 3,
        name: 'סט אביזרים',
        pointsCost: 500,
        image: '/lovable-uploads/bde00d1e-667f-47df-98d8-9c7c4fb4dbda.png'
      }
    ]
  });

  // Function to redeem a gift
  const redeemGift = (giftId: number) => {
    setUserClub(prevClub => {
      const gift = prevClub.availableGifts.find(gift => gift.id === giftId);
      if (gift && prevClub.points >= gift.pointsCost) {
        return {
          ...prevClub,
          points: prevClub.points - gift.pointsCost,
          availableGifts: prevClub.availableGifts.filter(gift => gift.id !== giftId)
        };
      } else {
        alert('Not enough points to redeem this gift.');
        return prevClub;
      }
    });
  };

  // Function to update user club points
  const updateUserClubPoints = (points: number) => {
    setUserClub(prevClub => ({
      ...prevClub,
      points: prevClub.points + points
    }));
  };

  // Updated function to add new appointment with proper structure
  const addNewAppointment = (appointment: any) => {
    console.log('Adding new appointment:', appointment); // Debug log
    
    const newAppointment: Appointment = {
      id: appointment.id,
      customerName: appointment.therapistName, // Use therapist name for display
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      status: 'נקבע',
      duration: appointment.duration,
      phone: appointment.phone,
      therapistName: appointment.therapistName,
      institute: appointment.institute
    };
    
    console.log('Formatted appointment:', newAppointment); // Debug log
    setPendingAppointments(prev => {
      const updated = [...prev, newAppointment];
      console.log('Updated pending appointments:', updated); // Debug log
      return updated;
    });
  };

  // Function to add contact inquiry
  const addContactInquiry = (inquiry: ContactInquiry) => {
    setContactInquiries(prev => [...prev, inquiry]);
  };

  // Mock password reset functions
  const sendPasswordResetCode = async (email: string): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Password reset code for ${email}: ${code}`);
    return code;
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // For demo purposes, accept any 6-digit code
    return code.length === 6 && /^\d+$/.test(code);
  };

  return (
    <DataContext.Provider value={{ 
      confirmedAppointments,
      historyAppointments,
      pendingAppointments,
      rescheduleRequests,
      updateAppointmentStatus,
      requestReschedule,
      approveReschedule,
      declineReschedule,
      userClub,
      redeemGift,
      updateUserClubPoints,
      addNewAppointment,
      contactInquiries,
      addContactInquiry,
      selectedMapLocation,
      setSelectedMapLocation,
      sendPasswordResetCode,
      verifyResetCode,
      reviews,
      addReview
    }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, useData };
