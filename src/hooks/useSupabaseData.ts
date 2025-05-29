
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const useUserProfile = () => {
    return useQuery({
      queryKey: ['userProfile', user?.id],
      queryFn: async () => {
        if (!user?.id) return null;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  // Update user profile
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: async (profileData: any) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        toast({
          title: "הפרופיל עודכן בהצלחה",
          description: "השינויים נשמרו במערכת",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "שגיאה בעדכון הפרופיל",
          description: error.message,
        });
      },
    });
  };

  // Fetch institute by owner
  const useInstitute = () => {
    return useQuery({
      queryKey: ['institute', user?.id],
      queryFn: async () => {
        if (!user?.id) return null;
        const { data, error } = await supabase
          .from('institutes')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id && user?.role === 'provider',
    });
  };

  // Create or update institute
  const useUpsertInstitute = () => {
    return useMutation({
      mutationFn: async (instituteData: any) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('institutes')
          .upsert({ ...instituteData, owner_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['institute'] });
        toast({
          title: "המכון עודכן בהצלחה",
          description: "השינויים נשמרו במערכת",
        });
      },
    });
  };

  // Fetch services for institute
  const useServices = (instituteId?: string) => {
    return useQuery({
      queryKey: ['services', instituteId],
      queryFn: async () => {
        if (!instituteId) return [];
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('institute_id', instituteId);
        
        if (error) throw error;
        return data;
      },
      enabled: !!instituteId,
    });
  };

  // Create service
  const useCreateService = () => {
    return useMutation({
      mutationFn: async (serviceData: any) => {
        const { data, error } = await supabase
          .from('services')
          .insert(serviceData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
        toast({
          title: "השירות נוסף בהצלחה",
          description: "השירות החדש זמין במערכת",
        });
      },
    });
  };

  // Update service
  const useUpdateService = () => {
    return useMutation({
      mutationFn: async ({ id, serviceData }: { id: string; serviceData: any }) => {
        const { data, error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
        toast({
          title: "השירות עודכן בהצלחה",
          description: "השינויים נשמרו במערכת",
        });
      },
    });
  };

  // Delete service
  const useDeleteService = () => {
    return useMutation({
      mutationFn: async (serviceId: string) => {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', serviceId);
        
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
        toast({
          title: "השירות נמחק בהצלחה",
          description: "השירות הוסר מהמערכת",
        });
      },
    });
  };

  // Fetch therapists for institute
  const useTherapists = (instituteId?: string) => {
    return useQuery({
      queryKey: ['therapists', instituteId],
      queryFn: async () => {
        if (!instituteId) return [];
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('institute_id', instituteId);
        
        if (error) throw error;
        return data;
      },
      enabled: !!instituteId,
    });
  };

  // Create therapist
  const useCreateTherapist = () => {
    return useMutation({
      mutationFn: async (therapistData: any) => {
        const { data, error } = await supabase
          .from('therapists')
          .insert(therapistData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['therapists'] });
        toast({
          title: "המטפל נוסף בהצלחה",
          description: "המטפל החדש זמין במערכת",
        });
      },
    });
  };

  // Update therapist
  const useUpdateTherapist = () => {
    return useMutation({
      mutationFn: async ({ id, therapistData }: { id: string; therapistData: any }) => {
        const { data, error } = await supabase
          .from('therapists')
          .update(therapistData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['therapists'] });
        toast({
          title: "המטפל עודכן בהצלחה",
          description: "השינויים נשמרו במערכת",
        });
      },
    });
  };

  // Fetch business hours
  const useBusinessHours = (instituteId?: string) => {
    return useQuery({
      queryKey: ['businessHours', instituteId],
      queryFn: async () => {
        if (!instituteId) return [];
        const { data, error } = await supabase
          .from('business_hours')
          .select('*')
          .eq('institute_id', instituteId)
          .order('day_of_week');
        
        if (error) throw error;
        return data;
      },
      enabled: !!instituteId,
    });
  };

  // Update business hours
  const useUpdateBusinessHours = () => {
    return useMutation({
      mutationFn: async (businessHoursData: any[]) => {
        const { data, error } = await supabase
          .from('business_hours')
          .upsert(businessHoursData)
          .select();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessHours'] });
        toast({
          title: "שעות הפעילות עודכנו בהצלחה",
          description: "השינויים נשמרו במערכת",
        });
      },
    });
  };

  // Fetch gallery images
  const useGalleryImages = (instituteId?: string) => {
    return useQuery({
      queryKey: ['galleryImages', instituteId],
      queryFn: async () => {
        if (!instituteId) return [];
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('institute_id', instituteId);
        
        if (error) throw error;
        return data;
      },
      enabled: !!instituteId,
    });
  };

  // Add gallery image
  const useAddGalleryImage = () => {
    return useMutation({
      mutationFn: async (imageData: any) => {
        const { data, error } = await supabase
          .from('gallery_images')
          .insert(imageData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
        toast({
          title: "התמונה נוספה בהצלחה",
          description: "התמונה החדשה זמינה בגלריה",
        });
      },
    });
  };

  // Delete gallery image
  const useDeleteGalleryImage = () => {
    return useMutation({
      mutationFn: async (imageId: string) => {
        const { error } = await supabase
          .from('gallery_images')
          .delete()
          .eq('id', imageId);
        
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
        toast({
          title: "התמונה נמחקה בהצלחה",
          description: "התמונה הוסרה מהגלריה",
        });
      },
    });
  };

  // Fetch appointments
  const useAppointments = () => {
    return useQuery({
      queryKey: ['appointments', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        let query = supabase.from('appointments').select('*');
        
        if (user.role === 'customer') {
          query = query.eq('user_id', user.id);
        } else if (user.role === 'provider') {
          // Get appointments for provider's institute
          const { data: institute } = await supabase
            .from('institutes')
            .select('id')
            .eq('owner_id', user.id)
            .single();
          
          if (institute) {
            query = query.eq('institute_id', institute.id);
          }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  // Update appointment status
  const useUpdateAppointment = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }) => {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        toast({
          title: "התור עודכן בהצלחה",
          description: "השינויים נשמרו במערכת",
        });
      },
    });
  };

  return {
    useUserProfile,
    useUpdateProfile,
    useInstitute,
    useUpsertInstitute,
    useServices,
    useCreateService,
    useUpdateService,
    useDeleteService,
    useTherapists,
    useCreateTherapist,
    useUpdateTherapist,
    useBusinessHours,
    useUpdateBusinessHours,
    useGalleryImages,
    useAddGalleryImage,
    useDeleteGalleryImage,
    useAppointments,
    useUpdateAppointment,
  };
};
