
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbOperations } from '@/lib/database';
import { useAuth } from './AuthContext';

// Define the data types
interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'נקבע' | 'הושלם' | 'בוטל' | 'ממתין לאישור שינוי';
  duration?: string;
  phone?: string;
  therapistName?: string;
  therapistId?: string | null;
  institute?: string;
  instituteId?: string;
  originalDate?: string;
  originalTime?: string;
  requestedDate?: string;
  requestedTime?: string;
  price?: number;
}

interface Gift {
  id: string;
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

interface LoyaltyData {
  loyalty_level: string;
  current_points: number;
  next_level_points: number;
  benefits: string[];
}

interface DatabaseGift {
  id: string;
  name: string;
  points_cost: number;
  image_url: string;
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
  updateAppointmentStatus: (appointmentId: string | number, currentStatus: string, newStatus: string) => void;
  requestReschedule: (appointmentId: string | number, newDate: string, newTime: string) => void;
  approveReschedule: (appointmentId: string | number) => void;
  declineReschedule: (appointmentId: string | number) => void;
  userClub: UserClub;
  redeemGift: (giftId: string) => Promise<void>;
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
  institutes: any[];
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
  const { user, isAuthenticated } = useAuth();
  
  // State for appointments - now loaded from real database
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);

  const [rescheduleRequests, setRescheduleRequests] = useState<Appointment[]>([]);

  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [selectedMapLocation, setSelectedMapLocation] = useState<MapLocation | null>(null);

  // Reviews state - now loaded from real database
  const [reviews, setReviews] = useState<Review[]>([]);

  // Institutes state - loaded from database
  const [institutes, setInstitutes] = useState<any[]>([]);

  // Load data from database on component mount
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // Only load appointments if user is authenticated
        if (!isAuthenticated || !user?.id) {
          // Clear appointments for unauthenticated users
          setConfirmedAppointments([]);
          setPendingAppointments([]);
          setHistoryAppointments([]);
          return;
        }

        let allAppointments = [];

        if (user.role === 'provider') {
          // For providers, load appointments for their institutes
          const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
          
          if (userInstitutes.length > 0) {
            // Get appointments for all user's institutes
            const instituteAppointments = await Promise.all(
              userInstitutes.map(institute => dbOperations.getAppointmentsByInstitute(institute.id))
            );
            allAppointments = instituteAppointments.flat();
          }
        } else {
          // For customers, load their personal appointments
          allAppointments = await dbOperations.getAppointmentsByUser(user.id);
        }

        // Transform database appointments to match our interface
        const transformedAppointments = allAppointments.map(apt => ({
          id: apt.id, // Use full UUID to prevent key collisions
          customerName: apt.service_name, // Use service name for display
          service: apt.service_name,
          date: apt.appointment_date,
          time: apt.appointment_time,
          status: apt.status === 'confirmed' ? 'נקבע' as const :
                  apt.status === 'completed' ? 'הושלם' as const :
                  apt.status === 'cancelled' ? 'בוטל' as const :
                  'ממתין לאישור שינוי' as const,
          duration: '45 דקות', // Default duration - could be loaded from services table
          phone: apt.phone || '050-1234567', // Use appointment phone or default
          therapistName: apt.service_name, // Use service name as therapist name for now
          therapistId: null, // Therapist ID not stored in appointments table
          instituteId: apt.institute_id, // Keep institute ID for reviews
          price: parseFloat(apt.price) || 150 // Convert price to number with default value
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
        // Load reviews for user's institutes only
        let allReviews = [];
        
        if (user?.id && user.role === 'provider') {
          // For providers, load reviews only for their institutes
          const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
          
          for (const institute of userInstitutes) {
            const instituteReviews = await dbOperations.getReviewsByInstitute(institute.id);
            allReviews.push(...instituteReviews.map(review => ({
              id: review.id,
              customerName: review.user_name || 'לקוח אנונימי',
              customerId: review.user_id,
              instituteName: institute.institute_name,
              instituteId: institute.id,
              therapistName: 'מטפל',
              therapistId: 1,
              rating: review.rating,
              reviewText: review.content,
              isAnonymous: review.is_anonymous || false,
              submittedAt: new Date(review.review_date || review.created_at)
            })));
          }
        } else {
          // For customers, load all reviews
          const institutes = await dbOperations.getInstitutes();
          
          for (const institute of institutes) {
            const instituteReviews = await dbOperations.getReviewsByInstitute(institute.id);
            allReviews.push(...instituteReviews.map(review => ({
              id: review.id,
              customerName: review.user_name || 'לקוח אנונימי',
              customerId: review.user_id,
              instituteName: institute.institute_name,
              instituteId: institute.id,
              therapistName: 'מטפל',
              therapistId: 1,
              rating: review.rating,
              reviewText: review.content,
              isAnonymous: review.is_anonymous || false,
              submittedAt: new Date(review.review_date || review.created_at)
            })));
          }
        }

        setReviews(allReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    const loadLoyaltyData = async () => {
      if (!user?.id) return;

      try {
        // Load user loyalty data
        const loyaltyData = await dbOperations.getUserLoyalty(user.id) as LoyaltyData;
        if (loyaltyData) {
          setUserClub(prevClub => ({
            ...prevClub,
            level: loyaltyData.loyalty_level,
            points: loyaltyData.current_points,
            nextLevelPoints: loyaltyData.next_level_points,
            benefits: loyaltyData.benefits
          }));
        }

        // Load available gifts
        const gifts = await dbOperations.getAvailableGifts() as DatabaseGift[];
        if (gifts) {
          setUserClub(prevClub => ({
            ...prevClub,
            availableGifts: gifts.map(gift => ({
              id: gift.id, // Use full UUID as string
              name: gift.name,
              pointsCost: gift.points_cost,
              image: gift.image_url || '/placeholder.svg'
            }))
          }));
        }
      } catch (error) {
        console.error('Error loading loyalty data:', error);
      }
    };

    const loadInstitutes = async () => {
      try {
        const institutesData = await dbOperations.getInstitutes();
        setInstitutes(institutesData);
      } catch (error) {
        console.error('Error loading institutes:', error);
      }
    };

    loadAppointments();
    loadReviews();
    loadInstitutes();

    if (user?.id) {
      loadLoyaltyData();
    }
  }, [isAuthenticated, user?.id]);

  // Add review function
  const addReview = (review: Review) => {
    setReviews(prev => [...prev, review]);
  };

  // Function to request appointment rescheduling
  const requestReschedule = (appointmentId: string | number, newDate: string, newTime: string) => {
    const appointment = confirmedAppointments.find(apt => apt.id.toString() === appointmentId.toString());
    if (appointment) {
      const rescheduleRequest = {
        ...appointment,
        originalDate: appointment.date,
        originalTime: appointment.time,
        requestedDate: newDate,
        requestedTime: newTime,
        status: 'ממתין לאישור שינוי' as const
      };
      
      setConfirmedAppointments(prev => prev.filter(apt => apt.id.toString() !== appointmentId.toString()));
      setRescheduleRequests(prev => [...prev, rescheduleRequest]);
    }
  };

  // Function to approve reschedule request
  const approveReschedule = (appointmentId: string | number) => {
    const rescheduleRequest = rescheduleRequests.find(apt => apt.id.toString() === appointmentId.toString());
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
      
      setRescheduleRequests(prev => prev.filter(apt => apt.id.toString() !== appointmentId.toString()));
      setConfirmedAppointments(prev => [...prev, approvedAppointment]);
    }
  };

  // Function to decline reschedule request
  const declineReschedule = (appointmentId: string | number) => {
    const rescheduleRequest = rescheduleRequests.find(apt => apt.id.toString() === appointmentId.toString());
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
      
      setRescheduleRequests(prev => prev.filter(apt => apt.id.toString() !== appointmentId.toString()));
      setConfirmedAppointments(prev => [...prev, declinedAppointment]);
    }
  };

  // Function to update appointment status
  const updateAppointmentStatus = async (appointmentId: string | number, currentStatus: string, newStatus: string) => {
    try {
      // Update appointment status in database
      await dbOperations.updateAppointmentStatus(appointmentId.toString(), newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled');
      
      const statusMap: { [key: string]: 'נקבע' | 'הושלם' | 'בוטל' } = {
        'pending': 'נקבע',
        'confirmed': 'נקבע',
        'completed': 'הושלם',
        'cancelled': 'בוטל'
      };

      const mappedNewStatus = statusMap[newStatus] || newStatus as 'נקבע' | 'הושלם' | 'בוטל';

      if (currentStatus === 'pending') {
        const appointment = pendingAppointments.find(apt => apt.id.toString() === appointmentId.toString());
        if (appointment) {
          setPendingAppointments(prev => prev.filter(apt => apt.id.toString() !== appointmentId.toString()));
          
          if (newStatus === 'confirmed') {
            setConfirmedAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
          } else if (newStatus === 'cancelled') {
            // Deduct points when appointment is cancelled (100 points penalty)
            updateUserClubPoints(-100);
            setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
          } else {
            setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
          }
        }
      } else if (currentStatus === 'confirmed') {
        const appointment = confirmedAppointments.find(apt => apt.id.toString() === appointmentId.toString());
        if (appointment) {
          setConfirmedAppointments(prev => prev.filter(apt => apt.id.toString() !== appointmentId.toString()));
          
          if (newStatus === 'cancelled') {
            // Deduct points when confirmed appointment is cancelled
            updateUserClubPoints(-100);
          } else if (newStatus === 'completed') {
            // Add points when appointment is completed
            updateUserClubPoints(100);
          }
          
          setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  };

  // User club data - now loaded from database
  const [userClub, setUserClub] = useState({
    level: 'ברונזה',
    points: 0,
    nextLevelPoints: 200,
    benefits: ['נקודות על כל טיפול', 'גישה למבצעים מיוחדים'],
    availableGifts: []
  });

  // Function to redeem a gift - now uses real database
  const redeemGift = async (giftId: string) => {
    if (!user?.id) return;

    try {
      const result = await dbOperations.redeemGift({
        user_id: user.id,
        gift_id: giftId
      }) as LoyaltyData;

      if (result) {
        // Update local state with new loyalty data
        setUserClub({
          level: result.loyalty_level,
          points: result.current_points,
          nextLevelPoints: result.next_level_points,
          benefits: result.benefits,
          availableGifts: userClub.availableGifts.filter(gift => gift.id !== giftId)
        });
      }
    } catch (error) {
      console.error('Error redeeming gift:', error);
      throw error; // Re-throw error so it can be caught by the caller
    }
  };

  // Function to update user club points - now uses real database
  const updateUserClubPoints = async (points: number) => {
    if (!user?.id) return;

    try {
      const result = await dbOperations.addLoyaltyPoints({
        user_id: user.id,
        points: points,
        source: 'appointment',
        description: 'נקודות על השלמת טיפול'
      }) as LoyaltyData;

      if (result) {
        // Update local state with new loyalty data
        setUserClub(prevClub => ({
          ...prevClub,
          level: result.loyalty_level,
          points: result.current_points,
          nextLevelPoints: result.next_level_points,
          benefits: result.benefits
        }));
      }
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  // Updated function to add new appointment with proper structure
  const addNewAppointment = (appointment: any) => {
    
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
    
    setPendingAppointments(prev => {
      const updated = [...prev, newAppointment];
      return updated;
    });
  };

  // Function to add contact inquiry
  const addContactInquiry = (inquiry: ContactInquiry) => {
    setContactInquiries(prev => [...prev, inquiry]);
  };


  const API_BASE_URL = '/.netlify/functions';

  // Password reset functions - now using real Brevo email service
  const sendPasswordResetCode = async (email: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-reset-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email');
      }

      // Return a success message instead of a code since we're sending a temporary password
      return 'Temporary password sent to your email';
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedCode = sessionStorage.getItem(`reset_code_${email}`);
      const expiry = sessionStorage.getItem(`reset_code_expiry_${email}`);
      
      if (!storedCode || !expiry) {
        return false;
      }
      
      // Check if code has expired
      if (Date.now() > parseInt(expiry)) {
        sessionStorage.removeItem(`reset_code_${email}`);
        sessionStorage.removeItem(`reset_code_expiry_${email}`);
        return false;
      }
      
      // Verify the code
      const isValid = storedCode === code;
      
      if (isValid) {
        // Clean up the stored code after successful verification
        sessionStorage.removeItem(`reset_code_${email}`);
        sessionStorage.removeItem(`reset_code_expiry_${email}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying reset code:', error);
      return false;
    }
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
      addReview,
      institutes
    }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, useData };
