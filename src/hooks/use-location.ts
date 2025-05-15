
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseLocationReturn {
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
}

export const useLocation = (): UseLocationReturn => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            variant: "destructive",
            title: "שגיאה במיקום",
            description: "לא הצלחנו לאתר את המיקום שלך. ודא שאפשרת גישה למיקום.",
          });
          // Set default location (Tel Aviv)
          setUserLocation({ lat: 32.0853, lng: 34.7818 });
          setError("Failed to get user location");
          setIsLoading(false);
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "מיקום לא נתמך",
        description: "הדפדפן שלך לא תומך בשירותי מיקום.",
      });
      // Set default location (Tel Aviv)
      setUserLocation({ lat: 32.0853, lng: 34.7818 });
      setError("Geolocation not supported");
      setIsLoading(false);
    }
  }, [toast]);

  return { userLocation, isLoading, error };
};
