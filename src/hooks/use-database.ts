import { useState, useEffect, useCallback } from 'react';
import { dbOperations, type Profile, type Institute, type Therapist, type Service, type Appointment, type Review, type Message } from '@/lib/database';

// Generic hook for database operations
export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Database operation failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { executeOperation, loading, error };
};

// Specific hooks for different entities
export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const getProfile = useCallback(async (id: string) => {
    return executeOperation(() => dbOperations.getProfile(id));
  }, [executeOperation]);

  const createProfile = useCallback(async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    return executeOperation(() => dbOperations.createProfile(profileData));
  }, [executeOperation]);

  return { profiles, getProfile, createProfile, loading, error };
};

export const useInstitutes = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const fetchInstitutes = useCallback(async () => {
    const result = await executeOperation(() => dbOperations.getInstitutes());
    if (result) setInstitutes(result);
    return result;
  }, [executeOperation]);

  const getInstitute = useCallback(async (id: string) => {
    return executeOperation(() => dbOperations.getInstitute(id));
  }, [executeOperation]);

  const getInstitutesByOwner = useCallback(async (ownerId: string) => {
    return executeOperation(() => dbOperations.getInstitutesByOwner(ownerId));
  }, [executeOperation]);

  useEffect(() => {
    fetchInstitutes();
  }, [fetchInstitutes]);

  return { 
    institutes, 
    fetchInstitutes, 
    getInstitute, 
    getInstitutesByOwner, 
    loading, 
    error 
  };
};

export const useTherapistsNew = (instituteId?: string) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const fetchTherapists = useCallback(async () => {
    if (!instituteId) return [];
    const result = await executeOperation(() => dbOperations.getTherapistsByInstitute(instituteId));
    if (result) setTherapists(result);
    return result;
  }, [executeOperation, instituteId]);

  const addTherapist = useCallback(async (therapistData: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await executeOperation(() => dbOperations.createTherapist(therapistData));
    if (result) {
      await fetchTherapists(); // Refresh the list
    }
    return result;
  }, [executeOperation, fetchTherapists]);

  const updateTherapist = useCallback(async (id: string, updates: Partial<Therapist>) => {
    const result = await executeOperation(() => dbOperations.updateTherapist(id, updates));
    if (result) {
      await fetchTherapists(); // Refresh the list
    }
    return result;
  }, [executeOperation, fetchTherapists]);

  const removeTherapist = useCallback(async (id: string) => {
    const result = await executeOperation(() => dbOperations.deleteTherapist(id));
    if (result !== null) {
      await fetchTherapists(); // Refresh the list
    }
    return result;
  }, [executeOperation, fetchTherapists]);

  useEffect(() => {
    if (instituteId) {
      fetchTherapists();
    }
  }, [fetchTherapists, instituteId]);

  return {
    therapists,
    loading,
    addTherapist,
    updateTherapist,
    removeTherapist,
    refetch: fetchTherapists
  };
};

export const useServices = (instituteId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const fetchServices = useCallback(async () => {
    if (!instituteId) return [];
    const result = await executeOperation(() => dbOperations.getServicesByInstitute(instituteId));
    if (result) setServices(result);
    return result;
  }, [executeOperation, instituteId]);

  useEffect(() => {
    if (instituteId) {
      fetchServices();
    }
  }, [fetchServices, instituteId]);

  return { services, fetchServices, loading, error };
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const getAppointmentsByUser = useCallback(async (userId: string) => {
    const result = await executeOperation(() => dbOperations.getAppointmentsByUser(userId));
    if (result) setAppointments(result);
    return result;
  }, [executeOperation]);

  const getAppointmentsByInstitute = useCallback(async (instituteId: string) => {
    const result = await executeOperation(() => dbOperations.getAppointmentsByInstitute(instituteId));
    if (result) setAppointments(result);
    return result;
  }, [executeOperation]);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    return executeOperation(() => dbOperations.createAppointment(appointmentData));
  }, [executeOperation]);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']) => {
    return executeOperation(() => dbOperations.updateAppointmentStatus(id, status));
  }, [executeOperation]);

  return {
    appointments,
    getAppointmentsByUser,
    getAppointmentsByInstitute,
    createAppointment,
    updateAppointmentStatus,
    loading,
    error
  };
};

export const useReviews = (instituteId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const fetchReviews = useCallback(async () => {
    if (!instituteId) return [];
    const result = await executeOperation(() => dbOperations.getReviewsByInstitute(instituteId));
    if (result) setReviews(result);
    return result;
  }, [executeOperation, instituteId]);

  const createReview = useCallback(async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const result = await executeOperation(() => dbOperations.createReview(reviewData));
    if (result) {
      await fetchReviews(); // Refresh the list
    }
    return result;
  }, [executeOperation, fetchReviews]);

  useEffect(() => {
    if (instituteId) {
      fetchReviews();
    }
  }, [fetchReviews, instituteId]);

  return { reviews, fetchReviews, createReview, loading, error };
};

export const useMessages = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { executeOperation, loading, error } = useDatabase();

  const fetchMessages = useCallback(async () => {
    if (!userId) return [];
    const result = await executeOperation(() => dbOperations.getMessagesByUser(userId));
    if (result) setMessages(result);
    return result;
  }, [executeOperation, userId]);

  const createMessage = useCallback(async (messageData: Omit<Message, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await executeOperation(() => dbOperations.createMessage(messageData));
    if (result) {
      await fetchMessages(); // Refresh the list
    }
    return result;
  }, [executeOperation, fetchMessages]);

  const markMessageAsRead = useCallback(async (id: string) => {
    const result = await executeOperation(() => dbOperations.markMessageAsRead(id));
    if (result) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === id ? { ...msg, is_read: true } : msg
        )
      );
    }
    return result;
  }, [executeOperation]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [fetchMessages, userId]);

  return { 
    messages, 
    fetchMessages, 
    createMessage, 
    markMessageAsRead, 
    loading, 
    error 
  };
};
