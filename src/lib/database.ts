// Database operations now use API client for Netlify Functions
import { apiClient } from './api-client';

// Updated to use API client instead of direct database connection
export const db = {
  async query(text: string, params?: any[]) {
    // This is now handled by API endpoints
    console.log('Query delegated to API:', { text, params });
    return {
      rows: [],
      rowCount: 0
    };
  },

  async getClient() {
    return {
      query: this.query,
      release: () => {}
    };
  },

  async end() {
    return Promise.resolve();
  }
};

// Type definitions for database entities
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: 'customer' | 'provider';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Institute {
  id: string;
  owner_id?: string;
  institute_name: string;
  address?: string;
  service_name?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Therapist {
  id: string;
  institute_id: string;
  name: string;
  experience?: string;
  certification?: string;
  additional_certification?: string;
  bio?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  institute_id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessHours {
  id: string;
  institute_id: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_open?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  institute_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  user_id: string;
  institute_id: string;
  rating: number;
  content: string;
  review_date?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  user_id: string;
  institute_id?: string;
  sender_type: 'trainer' | 'institute_owner';
  message_type: 'appointment_refusal' | 'inquiry_reply';
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Database operations using API client to connect to real Neon database
export const dbOperations = {
  // Profiles
  async getProfile(id: string): Promise<Profile | null> {
    const response = await apiClient.getProfile(id);
    return response.data;
  },

  async createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    const response = await apiClient.createProfile(profile);
    if (!response.data) throw new Error(response.error || 'Failed to create profile');
    return response.data;
  },

  // Institutes
  async getInstitutes(): Promise<Institute[]> {
    const response = await apiClient.getInstitutes();
    return response.data || [];
  },

  async getInstitute(id: string): Promise<Institute | null> {
    const response = await apiClient.getInstitute(id);
    return response.data;
  },

  async getInstitutesByOwner(ownerId: string): Promise<Institute[]> {
    const response = await apiClient.getInstitutesByOwner(ownerId);
    return response.data || [];
  },

  // Therapists
  async getTherapistsByInstitute(instituteId: string): Promise<Therapist[]> {
    const response = await apiClient.getTherapistsByInstitute(instituteId);
    return response.data || [];
  },

  async createTherapist(therapist: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>): Promise<Therapist> {
    const response = await apiClient.createTherapist(therapist);
    if (!response.data) throw new Error(response.error || 'Failed to create therapist');
    return response.data;
  },

  async updateTherapist(id: string, updates: Partial<Therapist>): Promise<Therapist | null> {
    const response = await apiClient.updateTherapist(id, updates);
    return response.data;
  },

  async deleteTherapist(id: string): Promise<boolean> {
    const response = await apiClient.deleteTherapist(id);
    return response.data?.deleted || false;
  },

  // Services
  async getServicesByInstitute(instituteId: string): Promise<Service[]> {
    const response = await apiClient.getServicesByInstitute(instituteId);
    return response.data || [];
  },

  // Business Hours
  async getBusinessHoursByInstitute(instituteId: string): Promise<BusinessHours[]> {
    const response = await apiClient.getBusinessHoursByInstitute(instituteId);
    return response.data || [];
  },

  // Appointments
  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    const response = await apiClient.getAppointmentsByUser(userId);
    return response.data || [];
  },

  async getAppointmentsByInstitute(instituteId: string): Promise<Appointment[]> {
    const response = await apiClient.getAppointmentsByInstitute(instituteId);
    return response.data || [];
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const response = await apiClient.createAppointment(appointment);
    if (!response.data) throw new Error(response.error || 'Failed to create appointment');
    return response.data;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment | null> {
    const response = await apiClient.updateAppointmentStatus(id, status);
    return response.data;
  },

  // Reviews
  async getReviewsByInstitute(instituteId: string): Promise<Review[]> {
    const response = await apiClient.getReviewsByInstitute(instituteId);
    return response.data || [];
  },

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const response = await apiClient.createReview(review);
    if (!response.data) throw new Error(response.error || 'Failed to create review');
    return response.data;
  },

  // Messages
  async getMessagesByUser(userId: string): Promise<Message[]> {
    const response = await apiClient.getMessagesByUser(userId);
    return response.data || [];
  },

  async createMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> {
    const response = await apiClient.createMessage(message);
    if (!response.data) throw new Error(response.error || 'Failed to create message');
    return response.data;
  },

  async markMessageAsRead(id: string): Promise<Message | null> {
    const response = await apiClient.markMessageAsRead(id);
    return response.data;
  }
};
