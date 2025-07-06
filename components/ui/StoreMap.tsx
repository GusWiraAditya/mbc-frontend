"use client";

// REVISI 1: Impor AdvancedMarker sebagai ganti Marker
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface StoreMapProps {
  lat: number;
  lng: number;
}

export default function StoreMap({ lat, lng }: StoreMapProps) {
  const position = { lat, lng };
  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!apiKey) {
    return <div className="flex items-center justify-center h-full bg-muted rounded-lg"><p className="text-destructive">Google Maps API Key tidak dikonfigurasi.</p></div>;
  }
  
  return (
    <APIProvider apiKey={apiKey}>
      {/* --- REVISI DI SINI --- */}
      <div className="w-full h-80 md:h-96 rounded-lg overflow-hidden border">
        <Map
          defaultCenter={position}
          defaultZoom={16}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="madebycan_map_style" 
        >
          <AdvancedMarker position={position} />
        </Map>
      </div>
    </APIProvider>
  );
}