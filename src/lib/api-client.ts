// API client for Netlify Functions backend
// Connects to our serverless backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || '/.netlify/functions';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // Profiles
  async getProfile(id: string) {
    return this.request(`/profiles/${id}`);
  }

  async createProfile(profileData: any) {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Institutes
  async getInstitutes() {
    return this.request('/institutes');
  }

  async getInstitute(id: string) {
    return this.request(`/institutes/${id}`);
  }

  async getInstitutesByOwner(ownerId: string) {
    return this.request(`/institutes/owner/${ownerId}`);
  }

  // Therapists
  async getTherapistsByInstitute(instituteId: string) {
    return this.request(`/therapists/institute/${instituteId}`);
  }

  async getTherapist(id: string) {
    return this.request(`/therapists/${id}`);
  }

  async createTherapist(therapistData: any) {
    return this.request('/therapists', {
      method: 'POST',
      body: JSON.stringify(therapistData),
    });
  }

  // Services
  async getServicesByInstitute(instituteId: string) {
    return this.request(`/services/institute/${instituteId}`);
  }

  async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  // Business Hours
  async getBusinessHoursByInstitute(instituteId: string) {
    return this.request(`/business-hours/institute/${instituteId}`);
  }

  // Appointments
  async getAppointmentsByUser(userId: string) {
    return this.request(`/appointments/user/${userId}`);
  }

  async getAppointmentsByInstitute(instituteId: string) {
    return this.request(`/appointments/institute/${instituteId}`);
  }

  async createAppointment(appointmentData: any) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointmentStatus(id: string, status: string) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Reviews
  async getReviewsByInstitute(instituteId: string) {
    return this.request(`/reviews/institute/${instituteId}`);
  }

  async createReview(reviewData: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Messages
  async getMessagesByUser(userId: string) {
    return this.request(`/messages/user/${userId}`);
  }

  async createMessage(messageData: any) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(id: string) {
    return this.request(`/messages/${id}/read`, {
      method: 'PUT',
    });
  }
}

export const apiClient = new ApiClient();
