
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
}

export interface ContactInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

interface DataContextType {
  pendingAppointments: Appointment[];
  confirmedAppointments: Appointment[];
  historyAppointments: Appointment[];
  contactInquiries: ContactInquiry[];
  addContactInquiry: (inquiry: ContactInquiry) => void;
  updateAppointmentStatus: (appointmentId: number, fromStatus: string, toStatus: string) => void;
  requestAppointmentChange: (appointmentId: number, newDate: Date, newTime: string) => void;
  approveAppointmentChange: (appointmentId: number) => void;
  rejectAppointmentChange: (appointmentId: number) => void;
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

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(initialPendingAppointments);
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>(initialConfirmedAppointments);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>(initialHistoryAppointments);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);

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

  const value = {
    pendingAppointments,
    confirmedAppointments,
    historyAppointments,
    contactInquiries,
    addContactInquiry,
    updateAppointmentStatus,
    requestAppointmentChange,
    approveAppointmentChange,
    rejectAppointmentChange
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
