
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface MapComponentProps {
  userLocation: { lat: number; lng: number } | null;
  markers?: Array<{
    id: number;
    name: string;
    coordinates: { lat: number; lng: number };
    address?: string;
    rating?: number;
    hours?: string;
    therapists?: Array<{ name: string; specialty: string; experience: number }>;
  }>;
  onMarkerClick?: (id: number) => void;
}

const GoogleMapComponent: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapComponentProps['markers'];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick?: (id: number) => void;
}> = ({ center, zoom, markers = [], userLocation, onMarkerClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#444444"}]
          },
          {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
          },
          {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": -100}, {"lightness": 45}]
          },
          {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add user location marker if available
      if (userLocation) {
        const userMarker = new google.maps.Marker({
          position: userLocation,
          map,
          title: 'המיקום שלך',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });
        markersRef.current.push(userMarker);
      }

      // Add institute markers
      markers.forEach(marker => {
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(marker)
        });

        const mapMarker = new google.maps.Marker({
          position: marker.coordinates,
          map,
          title: marker.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#8257e6',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });

        mapMarker.addListener('click', () => {
          // Close all other info windows
          markersRef.current.forEach(m => {
            if (m !== mapMarker && (m as any).infoWindow) {
              (m as any).infoWindow.close();
            }
          });
          
          infoWindow.open(map, mapMarker);
          if (onMarkerClick) {
            onMarkerClick(marker.id);
          }
        });

        (mapMarker as any).infoWindow = infoWindow;
        markersRef.current.push(mapMarker);
      });
    }
  }, [map, markers, userLocation, onMarkerClick]);

  const createInfoWindowContent = (marker: NonNullable<MapComponentProps['markers']>[0]) => {
    let content = `
      <div dir="rtl" style="padding: 8px; max-width: 300px;">
        <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${marker.name}</h3>
    `;
    
    if (marker.address) {
      content += `<p style="color: #666; margin-bottom: 4px;">${marker.address}</p>`;
    }
    
    if (marker.rating) {
      content += `
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="margin-left: 4px;">${marker.rating}</span>
          <span style="color: #ffc107;">★</span>
        </div>
      `;
    }
    
    if (marker.hours) {
      content += `<p style="font-size: 14px; margin-bottom: 4px;">שעות פעילות: ${marker.hours}</p>`;
    }
    
    if (marker.therapists && marker.therapists.length > 0) {
      content += `<p style="font-weight: 500; margin-top: 8px; margin-bottom: 4px;">מטפלים:</p>`;
      marker.therapists.forEach(therapist => {
        content += `
          <div style="font-size: 14px; margin-bottom: 4px;">
            <span style="font-weight: 500;">${therapist.name}</span> - 
            ${therapist.specialty} (${therapist.experience} שנות ניסיון)
          </div>
        `;
      });
    }
    
    content += `</div>`;
    return content;
  };

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  markers = [],
  onMarkerClick,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { toast } = useToast();

  // Israel centered coordinates
  const israelCenter = { lat: 31.4117, lng: 35.0818 };

  // Load Google Maps script
  const loadGoogleMapsScript = useCallback((key: string) => {
    return new Promise<void>((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject());
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject();
      
      document.head.appendChild(script);
    });
  }, []);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).apiKey.value;
    
    if (!input) {
      toast({
        variant: "destructive",
        title: "נדרש מפתח Google Maps",
        description: "אנא הכנס מפתח Google Maps API כדי להציג את המפה",
      });
      return;
    }

    setIsLoading(true);
    setLoadError(false);
    
    try {
      await loadGoogleMapsScript(input);
      setApiKey(input);
      setShowKeyInput(false);
      
      toast({
        title: "מפה נטענה בהצלחה",
        description: "כעת ניתן לראות את המכונים הקרובים אליך",
      });
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      setLoadError(true);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת המפה",
        description: "אנא בדוק את מפתח ה-API ונסה שוב",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showKeyInput) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-medium mb-4">הזנת מפתח Google Maps</h3>
        <p className="text-gray-600 mb-6">
          על מנת להציג את המפה, יש להזין מפתח Google Maps API.
          ניתן להשיג מפתח בחינם ב
          <a 
            href="https://console.cloud.google.com/google/maps-apis" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary underline mx-1"
          >
            Google Cloud Console
          </a>
          .
        </p>
        <form onSubmit={handleKeySubmit} className="space-y-4">
          <input 
            type="text" 
            name="apiKey"
            placeholder="הכנס מפתח Google Maps API"
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'טוען...' : 'הצג מפה'}
          </Button>
        </form>
        {loadError && (
          <p className="text-red-600 mt-4">
            שגיאה בטעינת המפה. אנא בדוק את מפתח ה-API ונסה שוב.
          </p>
        )}
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען מפה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden h-[500px] shadow-lg">
      <GoogleMapComponent 
        center={israelCenter}
        zoom={7}
        markers={markers}
        userLocation={userLocation}
        onMarkerClick={onMarkerClick}
      />
    </div>
  );
};

export default MapComponent;
