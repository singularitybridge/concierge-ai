'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default marker icons in Next.js
const createIcon = (color: string, isMoving: boolean = false) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      ${isMoving ? '<polygon points="12,6 16,14 12,12 8,14" fill="white"/>' : '<circle cx="12" cy="12" r="4" fill="white"/>'}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-driver-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Icons for different states
const ICONS = {
  available: createIcon('#10B981'), // Green
  inTransit: createIcon('#3B82F6', true), // Blue with arrow
  atPickup: createIcon('#F59E0B'), // Amber
  atDropoff: createIcon('#8B5CF6'), // Purple
  offline: createIcon('#6B7280'), // Gray
  hotel: createIcon('#EC4899'), // Pink for hotel
  airport: createIcon('#06B6D4'), // Cyan for airport
};

// Hotel marker icon
const hotelIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EC4899" width="40" height="40">
      <rect x="3" y="8" width="18" height="12" rx="2" fill="#EC4899" stroke="white" stroke-width="2"/>
      <polygon points="12,2 22,10 2,10" fill="#EC4899" stroke="white" stroke-width="2"/>
      <rect x="10" y="14" width="4" height="6" fill="white"/>
    </svg>
  `,
  className: 'custom-hotel-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Airport marker icon
const airportIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#06B6D4" width="36" height="36">
      <circle cx="12" cy="12" r="10" fill="#06B6D4" stroke="white" stroke-width="2"/>
      <path d="M12 4L8 10H4L6 12L4 14H8L12 20L16 14H20L18 12L20 10H16L12 4Z" fill="white"/>
    </svg>
  `,
  className: 'custom-airport-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

interface DriverLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  status: 'available' | 'in_transit' | 'at_pickup' | 'at_dropoff' | 'offline';
  vehicleName?: string;
  currentTrip?: string;
  lastUpdated: string;
}

interface MapProps {
  drivers: DriverLocation[];
  selectedDriverId?: string | null;
  onDriverClick?: (driverId: string) => void;
  showHotel?: boolean;
  showAirport?: boolean;
  hotelLocation?: { lat: number; lng: number };
  airportLocation?: { lat: number; lng: number };
  tripRoutes?: Array<{
    driverId: string;
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
  }>;
  height?: string;
}

// Component to recenter map when selected driver changes
function MapController({ selectedDriverId, drivers }: { selectedDriverId?: string | null; drivers: DriverLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedDriverId) {
      const driver = drivers.find(d => d.id === selectedDriverId);
      if (driver) {
        map.flyTo([driver.lat, driver.lng], 14, { duration: 1 });
      }
    }
  }, [selectedDriverId, drivers, map]);

  return null;
}

export default function DriverMap({
  drivers,
  selectedDriverId,
  onDriverClick,
  showHotel = true,
  showAirport = true,
  hotelLocation = { lat: 42.8048, lng: 140.6874 },
  airportLocation = { lat: 42.7752, lng: 141.6925 },
  tripRoutes = [],
  height = '400px',
}: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{ height }}
        className="bg-slate-800 rounded-xl flex items-center justify-center"
      >
        <div className="text-white/50 text-sm">Loading map...</div>
      </div>
    );
  }

  const getDriverIcon = (driver: DriverLocation) => {
    if (driver.speed && driver.speed > 5) {
      return ICONS.inTransit;
    }
    switch (driver.status) {
      case 'available':
        return ICONS.available;
      case 'in_transit':
        return ICONS.inTransit;
      case 'at_pickup':
        return ICONS.atPickup;
      case 'at_dropoff':
        return ICONS.atDropoff;
      case 'offline':
        return ICONS.offline;
      default:
        return ICONS.available;
    }
  };

  // Calculate center of all drivers or default to hotel
  const center = drivers.length > 0
    ? [
        drivers.reduce((sum, d) => sum + d.lat, 0) / drivers.length,
        drivers.reduce((sum, d) => sum + d.lng, 0) / drivers.length,
      ] as [number, number]
    : [hotelLocation.lat, hotelLocation.lng] as [number, number];

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedDriverId={selectedDriverId} drivers={drivers} />

        {/* Hotel Marker */}
        {showHotel && (
          <Marker position={[hotelLocation.lat, hotelLocation.lng]} icon={hotelIcon}>
            <Popup>
              <div className="text-center">
                <strong>1898 Niseko Hotel</strong>
                <br />
                <span className="text-xs text-gray-500">Main Dispatch Point</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Airport Marker */}
        {showAirport && (
          <Marker position={[airportLocation.lat, airportLocation.lng]} icon={airportIcon}>
            <Popup>
              <div className="text-center">
                <strong>New Chitose Airport</strong>
                <br />
                <span className="text-xs text-gray-500">CTS Terminal</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Trip Routes */}
        {tripRoutes.map((route, i) => (
          <Polyline
            key={`route-${i}`}
            positions={[
              [route.pickup.lat, route.pickup.lng],
              [route.dropoff.lat, route.dropoff.lng],
            ]}
            pathOptions={{
              color: selectedDriverId === route.driverId ? '#3B82F6' : '#6B7280',
              weight: selectedDriverId === route.driverId ? 4 : 2,
              dashArray: '10, 10',
              opacity: 0.7,
            }}
          />
        ))}

        {/* Driver Markers */}
        {drivers.map(driver => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            icon={getDriverIcon(driver)}
            eventHandlers={{
              click: () => onDriverClick?.(driver.id),
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <div className="font-bold text-sm">{driver.name}</div>
                {driver.vehicleName && (
                  <div className="text-xs text-gray-600">{driver.vehicleName}</div>
                )}
                <div className="mt-1 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    driver.status === 'available' ? 'bg-green-500' :
                    driver.status === 'in_transit' ? 'bg-blue-500' :
                    driver.status === 'at_pickup' ? 'bg-amber-500' :
                    driver.status === 'at_dropoff' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-xs capitalize">{driver.status.replace('_', ' ')}</span>
                </div>
                {driver.speed !== undefined && driver.speed > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {driver.speed} km/h
                  </div>
                )}
                {driver.currentTrip && (
                  <div className="text-xs text-blue-600 mt-1">
                    Trip: {driver.currentTrip}
                  </div>
                )}
                <div className="text-[10px] text-gray-400 mt-1">
                  Updated: {new Date(driver.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
