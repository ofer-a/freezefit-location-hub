import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Therapist {
  id: string;
  name: string;
  experience: string;
  bio?: string;
  image_url?: string;
  certification?: string;
  additional_certification?: string;
  institute_id: string;
}

export const useTherapists = (instituteId?: string) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('therapists')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (instituteId) {
        query = query.eq('institute_id', instituteId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTherapists(data || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לטעון את רשימת המטפלים",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTherapist = async (therapistData: Omit<Therapist, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .insert([therapistData])
        .select()
        .single();

      if (error) throw error;

      setTherapists(prev => [...prev, data]);
      toast({
        title: "מטפל נוסף",
        description: "המטפל נוסף בהצלחה לרשימת המטפלים",
      });

      return data;
    } catch (error) {
      console.error('Error adding therapist:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן להוסיף את המטפל",
      });
      throw error;
    }
  };

  const updateTherapist = async (id: string, updates: Partial<Therapist>) => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTherapists(prev => 
        prev.map(therapist => 
          therapist.id === id ? { ...therapist, ...data } : therapist
        )
      );

      toast({
        title: "מטפל עודכן",
        description: "פרטי המטפל עודכנו בהצלחה",
      });

      return data;
    } catch (error) {
      console.error('Error updating therapist:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לעדכן את פרטי המטפל",
      });
      throw error;
    }
  };

  const removeTherapist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTherapists(prev => prev.filter(therapist => therapist.id !== id));
      toast({
        title: "מטפל הוסר",
        description: "המטפל הוסר בהצלחה מרשימת המטפלים",
      });
    } catch (error) {
      console.error('Error removing therapist:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן להסיר את המטפל",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, [instituteId]);

  return {
    therapists,
    loading,
    addTherapist,
    updateTherapist,
    removeTherapist,
    refetch: fetchTherapists
  };
};