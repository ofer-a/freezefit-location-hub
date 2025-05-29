
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for legacy features that don't need database persistence yet
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

interface UserClub {
  points: number;
  level: string;
  nextLevelPoints: number;
  benefits: string[];
  availableGifts: { id: number; name: string; pointsCost: number; image: string }[];
}

// Mock appointment interface for legacy features
interface MockAppointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  duration: string;
  phone?: string;
  status?: 'הושלם' | 'בוטל';
  therapistName?: string;
  institute?: string;
}

interface DataContextType {
  contactInquiries: ContactFormData[];
  addContactInquiry: (inquiry: ContactFormData) => void;
  userClub: UserClub;
  redeemGift: (giftId: number) => void;
  selectedMapLocation: { lat: number; lng: number } | null;
  setSelectedMapLocation: (location: { lat: number; lng: number } | null) => void;
  updateUserClubPoints: (points: number) => void;
  sendPasswordResetCode: (email: string) => Promise<string>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetCodes: Record<string, string>;
  // Mock appointment properties for backward compatibility
  pendingAppointments: MockAppointment[];
  confirmedAppointments: MockAppointment[];
  historyAppointments: MockAppointment[];
  updateAppointmentStatus: (id: number, fromStatus: string, toStatus: string) => void;
  addNewAppointment: (appointment: MockAppointment) => void;
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

// Mock appointment data
const mockPendingAppointments: MockAppointment[] = [
  {
    id: 1,
    customerName: "יוסי כהן",
    date: "15/06/2024",
    time: "14:00",
    service: "טיפול סטנדרטי",
    duration: "60 דקות",
    phone: "050-1234567"
  }
];

const mockConfirmedAppointments: MockAppointment[] = [
  {
    id: 2,
    customerName: "מרים לוי",
    date: "16/06/2024",
    time: "10:00",
    service: "טיפול ספורטאים",
    duration: "90 דקות",
    phone: "052-9876543"
  }
];

const mockHistoryAppointments: MockAppointment[] = [
  {
    id: 3,
    customerName: "דני רוזן",
    date: "10/05/2024",
    time: "16:00",
    service: "טיפול שיקום",
    duration: "45 דקות",
    phone: "053-1122334",
    status: "הושלם"
  }
];

// Provider component
export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Contact form inquiries (localStorage for now)
  const [contactInquiries, setContactInquiries] = useState<ContactFormData[]>(() => {
    try {
      const stored = localStorage.getItem('freezefit_contact_inquiries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // User club data (localStorage for now)
  const [userClub, setUserClub] = useState<UserClub>(() => {
    try {
      const stored = localStorage.getItem('freezefit_user_club');
      return stored ? JSON.parse(stored) : initialClubData;
    } catch {
      return initialClubData;
    }
  });
  
  // Map selection
  const [selectedMapLocation, setSelectedMapLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Password reset codes (localStorage for now)
  const [resetCodes, setResetCodes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('freezefit_reset_codes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Mock appointment states
  const [pendingAppointments, setPendingAppointments] = useState<MockAppointment[]>(mockPendingAppointments);
  const [confirmedAppointments, setConfirmedAppointments] = useState<MockAppointment[]>(mockConfirmedAppointments);
  const [historyAppointments, setHistoryAppointments] = useState<MockAppointment[]>(mockHistoryAppointments);
  
  // Add a new inquiry
  const addContactInquiry = (inquiry: ContactFormData) => {
    const updated = [...contactInquiries, inquiry];
    setContactInquiries(updated);
    localStorage.setItem('freezefit_contact_inquiries', JSON.stringify(updated));
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
      
      const updated = {
        ...prev,
        points: newPoints,
        level,
        nextLevelPoints
      };
      
      localStorage.setItem('freezefit_user_club', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Redeem gift functionality
  const redeemGift = (giftId: number) => {
    const gift = userClub.availableGifts.find(g => g.id === giftId);
    if (!gift) return;
    
    if (userClub.points >= gift.pointsCost) {
      const updated = {
        ...userClub,
        points: userClub.points - gift.pointsCost
      };
      setUserClub(updated);
      localStorage.setItem('freezefit_user_club', JSON.stringify(updated));
    }
  };
  
  // Send password reset code (mock implementation)
  const sendPasswordResetCode = async (email: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the code
        const updated = { ...resetCodes, [email.toLowerCase()]: code };
        setResetCodes(updated);
        localStorage.setItem('freezefit_reset_codes', JSON.stringify(updated));
        
        console.log(`Reset code for ${email}: ${code}`);
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

  // Mock appointment management functions
  const updateAppointmentStatus = (id: number, fromStatus: string, toStatus: string) => {
    if (fromStatus === 'pending' && toStatus === 'confirmed') {
      const appointment = pendingAppointments.find(app => app.id === id);
      if (appointment) {
        setPendingAppointments(prev => prev.filter(app => app.id !== id));
        setConfirmedAppointments(prev => [...prev, appointment]);
      }
    } else if ((fromStatus === 'pending' || fromStatus === 'confirmed') && toStatus === 'cancelled') {
      const pendingApp = pendingAppointments.find(app => app.id === id);
      const confirmedApp = confirmedAppointments.find(app => app.id === id);
      const appointment = pendingApp || confirmedApp;
      
      if (appointment) {
        if (pendingApp) {
          setPendingAppointments(prev => prev.filter(app => app.id !== id));
        } else {
          setConfirmedAppointments(prev => prev.filter(app => app.id !== id));
        }
        setHistoryAppointments(prev => [...prev, { ...appointment, status: 'בוטל' }]);
      }
    } else if (fromStatus === 'confirmed' && toStatus === 'completed') {
      const appointment = confirmedAppointments.find(app => app.id === id);
      if (appointment) {
        setConfirmedAppointments(prev => prev.filter(app => app.id !== id));
        setHistoryAppointments(prev => [...prev, { ...appointment, status: 'הושלם' }]);
      }
    }
  };

  const addNewAppointment = (appointment: MockAppointment) => {
    setPendingAppointments(prev => [...prev, appointment]);
  };
  
  return (
    <DataContext.Provider value={{
      contactInquiries,
      addContactInquiry,
      userClub,
      redeemGift,
      selectedMapLocation,
      setSelectedMapLocation,
      updateUserClubPoints,
      sendPasswordResetCode,
      verifyResetCode,
      resetCodes,
      pendingAppointments,
      confirmedAppointments,
      historyAppointments,
      updateAppointmentStatus,
      addNewAppointment
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
