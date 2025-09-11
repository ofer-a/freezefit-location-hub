// API client for Netlify Functions backend
// Connects to our serverless backend API

// Use relative path for production - this will work with any deployed domain
const API_BASE_URL = '/.netlify/functions';

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

  // Optimized endpoint for getting institutes with all related data
  async getInstitutesDetailed() {
    return this.request('/institutes-detailed');
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

  async createBusinessHours(businessHoursData: any) {
    return this.request('/business-hours', {
      method: 'POST',
      body: JSON.stringify(businessHoursData),
    });
  }

  async updateBusinessHours(id: string, businessHoursData: any) {
    return this.request(`/business-hours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(businessHoursData),
    });
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

  // Loyalty System
  async getUserLoyalty(userId: string) {
    return this.request(`/loyalty/user/${userId}`);
  }

  async getAvailableGifts() {
    return this.request('/loyalty/gifts');
  }

  async getUserTransactions(userId: string) {
    return this.request(`/loyalty/transactions/${userId}`);
  }

  async addLoyaltyPoints(data: {
    user_id: string;
    points: number;
    source: string;
    reference_id?: string;
    description?: string;
  }) {
    return this.request('/loyalty/add-points', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async redeemGift(data: { user_id: string; gift_id: string }) {
    return this.request('/loyalty/redeem-gift', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Workshops
  async getWorkshopsByInstitute(instituteId: string) {
    return this.request(`/workshops/institute/${instituteId}`);
  }

  async getAllWorkshops() {
    return this.request('/workshops');
  }

  async createWorkshop(workshopData: any) {
    return this.request('/workshops', {
      method: 'POST',
      body: JSON.stringify(workshopData),
    });
  }

  // Extended User Profiles
  async getExtendedUserProfile(userId: string) {
    return this.request(`/user-profiles/${userId}`);
  }

  async updateExtendedUserProfile(userId: string, profileData: any) {
    return this.request(`/user-profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Activities
  async getActivitiesByInstitute(instituteId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/activities/institute/${instituteId}${params}`);
  }

  async getActivitiesByUser(userId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/activities/user/${userId}${params}`);
  }

  async createActivity(activityData: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Institute ratings and coordinates
  async getInstituteRating(instituteId: string) {
    return this.request(`/institutes/${instituteId}/rating`);
  }

  async getInstituteCoordinates(instituteId: string) {
    return this.request(`/institutes/${instituteId}/coordinates`);
  }

  // Gallery Images
  async getGalleryImagesByInstitute(instituteId: string) {
    return this.request(`/gallery/institute/${instituteId}`);
  }

  async createGalleryImage(imageData: any) {
    return this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  }
}

export const apiClient = new ApiClient();
