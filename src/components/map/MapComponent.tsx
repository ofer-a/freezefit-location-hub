
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
    address?: string;
    rating?: number;
    hours?: string;
    therapists?: Array<{ name: string; specialty: string; experience: number }>;
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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapToken, setMapToken] = useState<string>('');
  const { toast } = useToast();
  
  // For demo purposes, allow user input
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Israel centered map coordinates
  const israelCenter = { lng: 35.0818, lat: 31.4117 };

  useEffect(() => {
    // Clean up previous markers when component unmounts
    return () => {
      markersRef.current.forEach(marker => marker.remove());
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;

    try {
      mapboxgl.accessToken = mapToken;
      
      // Initialize map centered on Israel
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [israelCenter.lng, israelCenter.lat],
        zoom: 7,
      });

      // Add user location marker if available
      if (userLocation) {
        const userMarker = new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);
          
        markersRef.current.push(userMarker);
      }
      
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
        markerElement.style.display = 'flex';
        markerElement.style.alignItems = 'center';
        markerElement.style.justifyContent = 'center';
        
        // Create popup with detailed information
        let popupHtml = `
          <div dir="rtl" class="p-2">
            <h3 class="font-bold text-lg">${marker.name}</h3>
        `;
        
        if (marker.address) {
          popupHtml += `<p class="text-gray-600">${marker.address}</p>`;
        }
        
        if (marker.rating) {
          popupHtml += `
            <div class="flex items-center mt-1">
              <span class="mr-1">${marker.rating}</span>
              <span class="text-yellow-500">★</span>
            </div>
          `;
        }
        
        if (marker.hours) {
          popupHtml += `<p class="text-sm mt-1">שעות פעילות: ${marker.hours}</p>`;
        }
        
        if (marker.therapists && marker.therapists.length > 0) {
          popupHtml += `<p class="font-medium mt-2">מטפלים:</p>`;
          marker.therapists.forEach(therapist => {
            popupHtml += `
              <div class="text-sm mt-1">
                <span class="font-medium">${therapist.name}</span> - 
                ${therapist.specialty} (${therapist.experience} שנות ניסיון)
              </div>
            `;
          });
        }
        
        popupHtml += `</div>`;
        
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          maxWidth: '300px'
        }).setHTML(popupHtml);
        
        // Add marker to map
        const mapMarker = new mapboxgl.Marker(markerElement)
          .setLngLat([marker.coordinates.lng, marker.coordinates.lat])
          .setPopup(popup)
          .addTo(map.current);
        
        markersRef.current.push(mapMarker);
        
        // Add click event
        markerElement.addEventListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(marker.id);
          }
        });
      });

      // Add RTL support for Hebrew
      if (map.current) {
        // Override RTL text labels for better Hebrew support
        map.current.on('styledata', () => {
          if (map.current) {
            const layers = map.current.getStyle().layers;
            for (const layer of layers!) {
              if (layer.type === 'symbol' && 'layout' in layer && layer.layout && layer.layout['text-field']) {
                map.current.setLayoutProperty(layer.id, 'text-field', [
                  'format',
                  ['get', 'name_he'],
                  { 'text-font': ['Arial Unicode MS Regular'] }
                ]);
              }
            }
          }
        });
      }

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
