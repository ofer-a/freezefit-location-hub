
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
