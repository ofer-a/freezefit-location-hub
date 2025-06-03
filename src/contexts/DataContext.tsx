import React, { createContext, useContext, useState } from 'react';

// Define the data types
interface Appointment {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'נקבע' | 'הושלם' | 'בוטל';
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

interface DataContextType {
  confirmedAppointments: Appointment[];
  historyAppointments: Appointment[];
  updateAppointmentStatus: (appointmentId: number, currentStatus: string, newStatus: string) => void;
  userClub: UserClub;
  redeemGift: (giftId: number) => void;
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
      status: 'נקבע'
    },
    {
      id: 2,
      customerName: 'שרה לוי',
      service: 'עיסוי רפואי',
      date: '2024-07-15',
      time: '14:00',
      status: 'נקבע'
    }
  ]);

  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([
    {
      id: 3,
      customerName: 'אבי כהן',
      service: 'טיפול פנים',
      date: '2024-06-10',
      time: '10:00',
      status: 'הושלם'
    },
    {
      id: 4,
      customerName: 'שרה לוי',
      service: 'עיסוי רפואי',
      date: '2024-06-15',
      time: '14:00',
      status: 'הושלם'
    },
    {
      id: 5,
      customerName: 'אבי כהן',
      service: 'טיפול פנים',
      date: '2024-05-10',
      time: '10:00',
      status: 'בוטל'
    },
    {
      id: 6,
      customerName: 'שרה לוי',
      service: 'עיסוי רפואי',
      date: '2024-05-15',
      time: '14:00',
      status: 'בוטל'
    }
  ]);

  // Function to update appointment status
  const updateAppointmentStatus = (appointmentId: number, currentStatus: string, newStatus: string) => {
    setConfirmedAppointments(prevAppointments =>
      prevAppointments.filter(appointment => appointment.id !== appointmentId)
    );
    
    setHistoryAppointments(prevAppointments => [
      ...prevAppointments,
      ...confirmedAppointments.filter(appointment => appointment.id === appointmentId)
    ]);
    
    setHistoryAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.id === appointmentId ? { ...appointment, status: newStatus } : appointment
      )
    );
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

  return (
    <DataContext.Provider value={{ 
      confirmedAppointments,
      historyAppointments,
      updateAppointmentStatus,
      userClub,
      redeemGift
    }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, useData };
