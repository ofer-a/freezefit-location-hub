
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockInstitutes } from '@/data/mockInstitutes';

// Types
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

interface Appointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  duration: string;
  phone?: string;
  therapistName?: string;
  institute?: string;
  status?: 'הושלם' | 'בוטל';
}

interface UserClub {
  points: number;
  level: string;
  nextLevelPoints: number;
  benefits: string[];
  availableGifts: { id: number; name: string; pointsCost: number; image: string }[];
}

// Store keys for localStorage
const STORAGE_KEYS = {
  CONTACT_INQUIRIES: 'freezefit_contact_inquiries',
  PENDING_APPOINTMENTS: 'freezefit_pending_appointments',
  CONFIRMED_APPOINTMENTS: 'freezefit_confirmed_appointments',
  HISTORY_APPOINTMENTS: 'freezefit_history_appointments',
  USER_CLUB: 'freezefit_user_club',
  RESET_CODES: 'freezefit_reset_codes'
};

interface DataContextType {
  contactInquiries: ContactFormData[];
  addContactInquiry: (inquiry: ContactFormData) => void;
  pendingAppointments: Appointment[];
  confirmedAppointments: Appointment[];
  historyAppointments: Appointment[];
  updateAppointmentStatus: (id: number, fromStatus: 'pending' | 'confirmed', toStatus: 'confirmed' | 'cancelled' | 'completed') => void;
  userClub: UserClub;
  redeemGift: (giftId: number) => void;
  selectedMapLocation: { lat: number; lng: number } | null;
  setSelectedMapLocation: (location: { lat: number; lng: number } | null) => void;
  addNewAppointment: (appointment: Appointment) => void;
  updateUserClubPoints: (points: number) => void;
  sendPasswordResetCode: (email: string) => Promise<string>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetCodes: Record<string, string>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial club benefits data
const initialClubData: UserClub = {
  points: 450,
  level: "כסף",
  nextLevelPoints: 1000,
  benefits: [
    "10% הנחה על טיפולים",
    "הזמנות מועדפות",
    "ביטול תורים ללא עמלה",
    "טיפול חינם בכל יום הולדת"
  ],
  availableGifts: [
    { id: 1, name: "טיפול מתנה", pointsCost: 200, image: "/placeholder.svg" },
    { id: 2, name: "חולצת מותג", pointsCost: 300, image: "/placeholder.svg" },
    { id: 3, name: "סט אביזרים", pointsCost: 500, image: "/placeholder.svg" }
  ]
};

// Helper functions to load and save from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error loading data from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving data to localStorage for key ${key}:`, error);
  }
};

// Provider component
export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Contact form inquiries
  const [contactInquiries, setContactInquiries] = useState<ContactFormData[]>(() => 
    loadFromStorage(STORAGE_KEYS.CONTACT_INQUIRIES, [])
  );
  
  // Appointments state with localStorage persistence
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(() =>
    loadFromStorage(STORAGE_KEYS.PENDING_APPOINTMENTS, [
      { id: 4, customerName: 'משה גולן', date: '15/05/2025', time: '15:00', service: 'טיפול ראשון', duration: '60 דקות', phone: '053-1112222' },
      { id: 5, customerName: 'מיכל דוידוב', date: '17/05/2025', time: '11:45', service: 'טיפול ספורטאים', duration: '60 דקות', phone: '050-3334444' }
    ])
  );
  
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>(() =>
    loadFromStorage(STORAGE_KEYS.CONFIRMED_APPOINTMENTS, [
      { id: 1, customerName: 'יוסי כהן', date: '15/05/2025', time: '10:00', service: 'טיפול סטנדרטי', duration: '45 דקות', phone: '050-1234567' },
      { id: 2, customerName: 'רונית לוי', date: '15/05/2025', time: '12:30', service: 'טיפול ספורטאים', duration: '60 דקות', phone: '052-9876543' },
      { id: 3, customerName: 'דוד מזרחי', date: '16/05/2025', time: '09:15', service: 'טיפול קצר', duration: '30 דקות', phone: '054-5678901' }
    ])
  );
  
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY_APPOINTMENTS, [
      { id: 6, customerName: 'אורי גבאי', date: '10/05/2025', time: '14:00', service: 'טיפול סטנדרטי', duration: '45 דקות', status: 'הושלם' },
      { id: 7, customerName: 'יעל פרץ', date: '11/05/2025', time: '16:30', service: 'טיפול שיקום', duration: '60 דקות', status: 'הושלם' },
      { id: 8, customerName: 'נועם אלוני', date: '08/05/2025', time: '10:00', service: 'טיפול קצר', duration: '30 דקות', status: 'בוטל' }
    ])
  );
  
  // User club data
  const [userClub, setUserClub] = useState<UserClub>(() =>
    loadFromStorage(STORAGE_KEYS.USER_CLUB, initialClubData)
  );
  
  // Map selection
  const [selectedMapLocation, setSelectedMapLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Password reset codes
  const [resetCodes, setResetCodes] = useState<Record<string, string>>(() =>
    loadFromStorage(STORAGE_KEYS.RESET_CODES, {})
  );
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONTACT_INQUIRIES, contactInquiries);
  }, [contactInquiries]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PENDING_APPOINTMENTS, pendingAppointments);
  }, [pendingAppointments]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONFIRMED_APPOINTMENTS, confirmedAppointments);
  }, [confirmedAppointments]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HISTORY_APPOINTMENTS, historyAppointments);
  }, [historyAppointments]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_CLUB, userClub);
  }, [userClub]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RESET_CODES, resetCodes);
  }, [resetCodes]);
  
  // Add a new inquiry
  const addContactInquiry = (inquiry: ContactFormData) => {
    setContactInquiries(prev => [...prev, inquiry]);
  };
  
  // Update appointment status
  const updateAppointmentStatus = (
    id: number, 
    fromStatus: 'pending' | 'confirmed', 
    toStatus: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    let appointment;
    
    // Find and remove from source list
    if (fromStatus === 'pending') {
      appointment = pendingAppointments.find(appt => appt.id === id);
      setPendingAppointments(prev => prev.filter(appt => appt.id !== id));
    } else if (fromStatus === 'confirmed') {
      appointment = confirmedAppointments.find(appt => appt.id === id);
      setConfirmedAppointments(prev => prev.filter(appt => appt.id !== id));
      
      // If cancelling, subtract points
      if (toStatus === 'cancelled') {
        updateUserClubPoints(-25); // Penalty for cancellation
      }
    }
    
    if (!appointment) return;
    
    // Add to destination list
    if (toStatus === 'confirmed') {
      setConfirmedAppointments(prev => [...prev, appointment!]);
      
      // Add points for confirming an appointment
      updateUserClubPoints(10);
    } else {
      // Add to history with status
      setHistoryAppointments(prev => [
        ...prev, 
        { ...appointment!, status: toStatus === 'completed' ? 'הושלם' : 'בוטל' }
      ]);
      
      // Add points if completed
      if (toStatus === 'completed') {
        updateUserClubPoints(50);
      }
    }
  };
  
  // Add new appointment
  const addNewAppointment = (appointment: Appointment) => {
    setConfirmedAppointments(prev => [...prev, appointment]);
  };
  
  // Update user club points
  const updateUserClubPoints = (points: number) => {
    setUserClub(prev => {
      const newPoints = prev.points + points;
      
      // Determine level based on points
      let level = prev.level;
      let nextLevelPoints = prev.nextLevelPoints;
      
      if (newPoints >= 1000 && newPoints < 2000) {
        level = "זהב";
        nextLevelPoints = 2000;
      } else if (newPoints >= 2000) {
        level = "פלטינום";
        nextLevelPoints = 3000;
      }
      
      return {
        ...prev,
        points: newPoints,
        level,
        nextLevelPoints
      };
    });
  };
  
  // Redeem gift functionality
  const redeemGift = (giftId: number) => {
    const gift = userClub.availableGifts.find(g => g.id === giftId);
    if (!gift) return;
    
    if (userClub.points >= gift.pointsCost) {
      setUserClub(prev => ({
        ...prev,
        points: prev.points - gift.pointsCost
      }));
    }
  };
  
  // Send password reset code (mock implementation)
  const sendPasswordResetCode = async (email: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the code
        setResetCodes(prev => ({ ...prev, [email.toLowerCase()]: code }));
        
        console.log(`Reset code for ${email}: ${code}`);
        
        // In a real implementation, we would send an email here
        // with the reset code to the user's email address
        
        resolve(code);
      }, 1000);
    });
  };
  
  // Verify reset code
  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedCode = resetCodes[email.toLowerCase()];
        resolve(storedCode === code);
      }, 500);
    });
  };
  
  return (
    <DataContext.Provider value={{
      contactInquiries,
      addContactInquiry,
      pendingAppointments,
      confirmedAppointments,
      historyAppointments,
      updateAppointmentStatus,
      userClub,
      redeemGift,
      selectedMapLocation,
      setSelectedMapLocation,
      addNewAppointment,
      updateUserClubPoints,
      sendPasswordResetCode,
      verifyResetCode,
      resetCodes
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
