
import React from 'react';
import { cn } from '@/lib/utils';

interface Location {
  lat: number;
  lng: number;
  label?: string;
}

interface MapHistoryProps {
  locations: Location[];
  currentLocation: Location;
  onSelectLocation: (location: Location) => void;
}

export const MapHistory: React.FC<MapHistoryProps> = ({ 
  locations, 
  currentLocation,
  onSelectLocation
}) => {
  const isCurrentLocation = (location: Location) => {
    return location.lat === currentLocation.lat && 
           location.lng === currentLocation.lng;
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-drone-light">Location History</h2>
      <div className="space-y-2">
        {locations.map((location, index) => (
          <button
            key={index}
            onClick={() => onSelectLocation(location)}
            className={cn(
              "w-full text-left p-3 rounded-md transition-all duration-200 hover:bg-drone-light/10",
              isCurrentLocation(location) ? "bg-drone-light/20 border-l-2 border-drone-light" : "drone-glass"
            )}
          >
            <div className="text-sm font-semibold mb-1">
              {location.label || `Location ${index + 1}`}
            </div>
            <div className="text-xs font-mono text-gray-400">
              {location.lat.toFixed(6)}°N, {location.lng.toFixed(6)}°E
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
