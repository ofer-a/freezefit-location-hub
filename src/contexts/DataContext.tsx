
import React, { createContext, useContext, useState } from 'react';

// Define the data types
interface Appointment {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'נקבע' | 'הושלם' | 'בוטל';
  duration?: string;
  phone?: string;
  therapistName?: string;
  institute?: string;
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

interface DataContextType {
  confirmedAppointments: Appointment[];
  historyAppointments: Appointment[];
  pendingAppointments: Appointment[];
  updateAppointmentStatus: (appointmentId: number, currentStatus: string, newStatus: string) => void;
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
  // Mock appointments data (in a real app, this would come from an API)
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([
    {
      id: 1,
      customerName: 'אבי כהן',
      service: 'טיפול פנים',
      date: '2024-07-10',
      time: '10:00',
      status: 'נקבע',
      duration: '60 דקות',
      phone: '050-1234567'
    },
    {
      id: 2,
      customerName: 'שרה לוי',
      service: 'עיסוי רפואי',
      date: '2024-07-15',
      time: '14:00',
      status: 'נקבע',
      duration: '45 דקות',
      phone: '050-2345678'
    }
  ]);

  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([
    {
      id: 10,
      customerName: 'דן גולן',
      service: 'טיפול ספורטאים',
      date: '2024-07-12',
      time: '16:00',
      status: 'נקבע',
      duration: '30 דקות',
      phone: '050-3456789'
    }
  ]);

  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([
    {
      id: 3,
      customerName: 'אבי כהן',
      service: 'טיפול פנים',
      date: '2024-06-10',
      time: '10:00',
      status: 'הושלם',
      duration: '60 דקות',
      phone: '050-1234567'
    },
    {
      id: 4,
      customerName: 'שרה לוי',
      service: 'עיסוי רפואי',
      date: '2024-06-15',
      time: '14:00',
      status: 'הושלם',
      duration: '45 דקות',
      phone: '050-2345678'
    },
    {
      id: 5,
      customerName: 'אבי כהן',
      service: 'טיפול פנים',
      date: '2024-05-10',
      time: '10:00',
      status: 'בוטל',
      duration: '60 דקות',
      phone: '050-1234567'
    },
    {
      id: 6,
      customerName: 'שרה לוי',
      service: 'עיסוי רפואי',
      date: '2024-05-15',
      time: '14:00',
      status: 'בוטל',
      duration: '45 דקות',
      phone: '050-2345678'
    }
  ]);

  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [selectedMapLocation, setSelectedMapLocation] = useState<MapLocation | null>(null);

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
        } else {
          setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
        }
      }
    } else if (currentStatus === 'confirmed') {
      const appointment = confirmedAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setConfirmedAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        setHistoryAppointments(prev => [...prev, { ...appointment, status: mappedNewStatus }]);
      }
    }
  };

  // User club data with updated gift image
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
        name: 'טיפוח מתנה',
        pointsCost: 200,
        image: '/lovable-uploads/a1b8497e-3684-42ea-9ad8-69ff9ff062d1.png'
      },
      {
        id: 2,
        name: 'חולצת מותג',
        pointsCost: 350,
        image: '/placeholder.svg'
      },
      {
        id: 3,
        name: 'סט אביזרים',
        pointsCost: 500,
        image: '/placeholder.svg'
      },
      {
        id: 4,
        name: 'גיפט קארד 100₪',
        pointsCost: 600,
        image: '/placeholder.svg'
      },
      {
        id: 5,
        name: 'טיפול ספא זוגי',
        pointsCost: 800,
        image: '/placeholder.svg'
      },
      {
        id: 6,
        name: 'חופשה סוף שבוע',
        pointsCost: 1200,
        image: '/placeholder.svg'
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

  // Function to add new appointment
  const addNewAppointment = (appointment: any) => {
    const newAppointment: Appointment = {
      ...appointment,
      status: 'נקבע' as const
    };
    setPendingAppointments(prev => [...prev, newAppointment]);
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
      updateAppointmentStatus,
      userClub,
      redeemGift,
      updateUserClubPoints,
      addNewAppointment,
      contactInquiries,
      addContactInquiry,
      selectedMapLocation,
      setSelectedMapLocation,
      sendPasswordResetCode,
      verifyResetCode
    }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, useData };
