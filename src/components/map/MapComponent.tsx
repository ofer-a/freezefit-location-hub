
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  userLocation: { lat: number; lng: number } | null;
  markers?: Array<{
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    address?: string;
    rating?: number;
    hours?: string;
    therapists?: Array<{ name: string; specialty: string; experience: number }>;
  }>;
  onMarkerClick?: (id: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  markers = [],
  onMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Israel centered coordinates
  const israelCenter: [number, number] = [31.0461, 34.8516];

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map
      mapInstanceRef.current = L.map(mapRef.current).setView(israelCenter, 8);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Create markers layer
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup('המיקום שלך')
        .addTo(markersLayerRef.current);
    }

    // Add institute markers
    markers.forEach(marker => {
      const instituteIcon = L.divIcon({
        className: 'institute-marker',
        html: '<div style="background-color: #8257e6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupContent = createPopupContent(marker);
      
      const leafletMarker = L.marker([marker.coordinates.lat, marker.coordinates.lng], { icon: instituteIcon })
        .bindPopup(popupContent)
        .addTo(markersLayerRef.current!);

      // Add click event
      leafletMarker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker.id);
        }
      });
    });
  }, [markers, userLocation, onMarkerClick]);

  const createPopupContent = (marker: NonNullable<MapComponentProps['markers']>[0]) => {
    let content = `
      <div dir="rtl" style="padding: 8px; max-width: 300px; font-family: Arial, sans-serif;">
        <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #333;">${marker.name}</h3>
    `;
    
    if (marker.address) {
      content += `<p style="color: #666; margin-bottom: 4px; font-size: 14px;">${marker.address}</p>`;
    }
    
    if (marker.rating) {
      content += `
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="margin-left: 4px; font-size: 14px;">${marker.rating}</span>
          <span style="color: #ffc107; font-size: 16px;">★</span>
        </div>
      `;
    }
    
    if (marker.hours) {
      content += `<p style="font-size: 12px; margin-bottom: 4px; color: #555;">שעות פעילות: ${marker.hours}</p>`;
    }
    
    if (marker.therapists && marker.therapists.length > 0) {
      content += `<p style="font-weight: 500; margin-top: 8px; margin-bottom: 4px; font-size: 13px;">מטפלים:</p>`;
      marker.therapists.forEach(therapist => {
        content += `
          <div style="font-size: 12px; margin-bottom: 4px; color: #555;">
            <span style="font-weight: 500;">${therapist.name}</span> - 
            ${therapist.specialty} (${therapist.experience} שנות ניסיון)
          </div>
        `;
      });
    }
    
    content += `</div>`;
    return content;
  };

  return (
    <div className="relative rounded-lg overflow-hidden h-[500px] shadow-lg">
      <div ref={mapRef} className="w-full h-full" id="map" />
    </div>
  );
};

export default MapComponent;
