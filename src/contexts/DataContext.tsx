
import { createContext, useContext, useState, ReactNode } from 'react';

// Define appointment structure with therapist and service details
export interface Appointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  duration: string;
  phone?: string;
  status?: 'הושלם' | 'בוטל' | 'ממתין לאישור';
  therapistName: string;
  serviceName: string;
  changeRequested?: boolean;
  originalDate?: string;
  originalTime?: string;
  institute?: string;
}

export interface ContactInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

export interface UserClub {
  points: number;
  level: string;
  nextLevelPoints: number;
}

export interface MapLocation {
  lat: number;
  lng: number;
}

interface DataContextType {
  pendingAppointments: Appointment[];
  confirmedAppointments: Appointment[];
  historyAppointments: Appointment[];
  contactInquiries: ContactInquiry[];
  userClub: UserClub;
  selectedMapLocation: MapLocation | null;
  setSelectedMapLocation: (location: MapLocation | null) => void;
  addContactInquiry: (inquiry: ContactInquiry) => void;
  updateAppointmentStatus: (appointmentId: number, fromStatus: string, toStatus: string) => void;
  requestAppointmentChange: (appointmentId: number, newDate: Date, newTime: string) => void;
  approveAppointmentChange: (appointmentId: number) => void;
  rejectAppointmentChange: (appointmentId: number) => void;
  updateUserClubPoints: (points: number) => void;
  addNewAppointment: (appointment: Appointment) => void;
  sendPasswordResetCode: (email: string) => Promise<string>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial mock data with therapist and service details
const initialPendingAppointments: Appointment[] = [
  {
    id: 1,
    customerName: 'שרה כהן',
    date: '15/01/2025',
    time: '14:00',
    service: 'טיפול בקור',
    duration: '30 דקות',
    phone: '050-1234567',
    therapistName: 'רפאל ימין',
    serviceName: 'שיקום'
  },
  {
    id: 2,
    customerName: 'דוד לוי',
    date: '16/01/2025',
    time: '10:30',
    service: 'אמבט קרח',
    duration: '45 דקות',
    phone: '052-9876543',
    therapistName: 'מיכל דהן',
    serviceName: 'טיפול יופי'
  }
];

const initialConfirmedAppointments: Appointment[] = [
  {
    id: 3,
    customerName: 'רונית גולד',
    date: '14/01/2025',
    time: '16:00',
    service: 'טיפול שיקום',
    duration: '60 דקות',
    phone: '053-5555555',
    therapistName: 'אבי שמעון',
    serviceName: 'פיזיותרפיה'
  }
];

const initialHistoryAppointments: Appointment[] = [
  {
    id: 4,
    customerName: 'אמיר חדד',
    date: '10/01/2025',
    time: '09:00',
    service: 'אמבט קרח',
    duration: '30 דקות',
    status: 'הושלם',
    therapistName: 'רפאל ימין',
    serviceName: 'שיקום'
  }
];

const initialUserClub: UserClub = {
  points: 0,
  level: 'ברונזה',
  nextLevelPoints: 100
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(initialPendingAppointments);
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>(initialConfirmedAppointments);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>(initialHistoryAppointments);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [userClub, setUserClub] = useState<UserClub>(initialUserClub);
  const [selectedMapLocation, setSelectedMapLocation] = useState<MapLocation | null>(null);

  const addContactInquiry = (inquiry: ContactInquiry) => {
    setContactInquiries(prev => [inquiry, ...prev]);
  };

  const updateAppointmentStatus = (appointmentId: number, fromStatus: string, toStatus: string) => {
    let appointment: Appointment | undefined;

    // Find and remove from source array
    if (fromStatus === 'pending') {
      const index = pendingAppointments.findIndex(apt => apt.id === appointmentId);
      if (index !== -1) {
        appointment = pendingAppointments[index];
        setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      }
    } else if (fromStatus === 'confirmed') {
      const index = confirmedAppointments.findIndex(apt => apt.id === appointmentId);
      if (index !== -1) {
        appointment = confirmedAppointments[index];
        setConfirmedAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      }
    }

    if (!appointment) return;

    // Add to destination array
    if (toStatus === 'confirmed') {
      setConfirmedAppointments(prev => [...prev, appointment!]);
    } else if (toStatus === 'cancelled' || toStatus === 'completed') {
      const updatedAppointment = {
        ...appointment,
        status: toStatus === 'cancelled' ? 'בוטל' as const : 'הושלם' as const
      };
      setHistoryAppointments(prev => [...prev, updatedAppointment]);
    }
  };

  const requestAppointmentChange = (appointmentId: number, newDate: Date, newTime: string) => {
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Find appointment in confirmed list
    const appointmentIndex = confirmedAppointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex === -1) return;

    const appointment = confirmedAppointments[appointmentIndex];
    
    // Create change request - move to pending with change flag
    const changeRequest: Appointment = {
      ...appointment,
      originalDate: appointment.date,
      originalTime: appointment.time,
      date: formatDate(newDate),
      time: newTime,
      changeRequested: true,
      status: 'ממתין לאישור'
    };

    // Remove from confirmed and add to pending
    setConfirmedAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    setPendingAppointments(prev => [...prev, changeRequest]);
  };

  const approveAppointmentChange = (appointmentId: number) => {
    const appointmentIndex = pendingAppointments.findIndex(apt => apt.id === appointmentId && apt.changeRequested);
    if (appointmentIndex === -1) return;

    const appointment = pendingAppointments[appointmentIndex];
    
    // Remove change flags and move to confirmed
    const approvedAppointment: Appointment = {
      ...appointment,
      changeRequested: false,
      originalDate: undefined,
      originalTime: undefined,
      status: undefined
    };

    setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    setConfirmedAppointments(prev => [...prev, approvedAppointment]);
  };

  const rejectAppointmentChange = (appointmentId: number) => {
    const appointmentIndex = pendingAppointments.findIndex(apt => apt.id === appointmentId && apt.changeRequested);
    if (appointmentIndex === -1) return;

    const appointment = pendingAppointments[appointmentIndex];
    
    // Restore original date/time and move back to confirmed
    const restoredAppointment: Appointment = {
      ...appointment,
      date: appointment.originalDate || appointment.date,
      time: appointment.originalTime || appointment.time,
      changeRequested: false,
      originalDate: undefined,
      originalTime: undefined,
      status: undefined
    };

    setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    setConfirmedAppointments(prev => [...prev, restoredAppointment]);
  };

  const updateUserClubPoints = (points: number) => {
    setUserClub(prev => {
      const newPoints = prev.points + points;
      let newLevel = prev.level;
      let nextLevelPoints = prev.nextLevelPoints;

      // Update level based on points
      if (newPoints >= 500) {
        newLevel = 'יהלום';
        nextLevelPoints = 1000;
      } else if (newPoints >= 200) {
        newLevel = 'זהב';
        nextLevelPoints = 500;
      } else if (newPoints >= 100) {
        newLevel = 'כסף';
        nextLevelPoints = 200;
      } else {
        newLevel = 'ברונזה';
        nextLevelPoints = 100;
      }

      return {
        points: newPoints,
        level: newLevel,
        nextLevelPoints
      };
    });
  };

  const addNewAppointment = (appointment: Appointment) => {
    setPendingAppointments(prev => [...prev, appointment]);
  };

  const sendPasswordResetCode = async (email: string): Promise<string> => {
    // Mock implementation - in real app this would send email
    return new Promise((resolve) => {
      setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        resolve(code);
      }, 1000);
    });
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    // Mock implementation - in real app this would verify against database
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, accept any 6-digit code
        resolve(code.length === 6 && /^\d+$/.test(code));
      }, 500);
    });
  };

  const value = {
    pendingAppointments,
    confirmedAppointments,
    historyAppointments,
    contactInquiries,
    userClub,
    selectedMapLocation,
    setSelectedMapLocation,
    addContactInquiry,
    updateAppointmentStatus,
    requestAppointmentChange,
    approveAppointmentChange,
    rejectAppointmentChange,
    updateUserClubPoints,
    addNewAppointment,
    sendPasswordResetCode,
    verifyResetCode
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
