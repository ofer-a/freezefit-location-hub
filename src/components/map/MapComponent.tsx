
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface MapComponentProps {
  userLocation: { lat: number; lng: number } | null;
  markers?: Array<{
    id: number;
    name: string;
    coordinates: { lat: number; lng: number };
  }>;
  onMarkerClick?: (id: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  markers = [],
  onMarkerClick,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const { toast } = useToast();
  
  // In a real app, this would be stored in environment variables
  // For demo purposes, allow user input
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !mapToken || !userLocation) return;

    try {
      mapboxgl.accessToken = mapToken;
      
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.lng, userLocation.lat],
        zoom: 11,
      });

      // Add user location marker
      new mapboxgl.Marker({ color: '#0000FF' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      // Add institute markers
      markers.forEach(marker => {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.width = '25px';
        markerElement.style.height = '25px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = '#8257e6';
        markerElement.style.border = '2px solid white';
        markerElement.style.cursor = 'pointer';
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${marker.name}</strong>`);
        
        // Add marker to map
        const mapMarker = new mapboxgl.Marker(markerElement)
          .setLngLat([marker.coordinates.lng, marker.coordinates.lat])
          .setPopup(popup)
          .addTo(map.current);
        
        // Add click event
        markerElement.addEventListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(marker.id);
          }
        });
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      toast({
        title: "מפה נטענה בהצלחה",
        description: "כעת ניתן לראות את המכונים הקרובים אליך",
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת המפה",
        description: "אירעה שגיאה בטעינת המפה. אנא נסה שוב מאוחר יותר.",
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [userLocation, markers, mapToken, onMarkerClick, toast]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).token.value;
    if (!input) {
      toast({
        variant: "destructive",
        title: "נדרש מפתח Mapbox",
        description: "אנא הכנס מפתח Mapbox ציבורי כדי להציג את המפה",
      });
      return;
    }
    setMapToken(input);
    setShowTokenInput(false);
  };

  if (showTokenInput) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-medium mb-4">הזנת מפתח Mapbox</h3>
        <p className="text-gray-600 mb-6">
          על מנת להציג את המפה, יש להזין מפתח Mapbox ציבורי.
          ניתן להשיג מפתח בחינם באתר <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mapbox</a>.
        </p>
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <input 
            type="text" 
            name="token"
            placeholder="הכנס מפתח Mapbox ציבורי"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <Button type="submit">הצג מפה</Button>
        </form>
      </Card>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden h-[500px] shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapComponent;
