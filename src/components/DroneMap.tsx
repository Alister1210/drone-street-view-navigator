
import React, { useEffect, useRef, useState } from 'react';
import { MapHistory } from './MapHistory';
import { BatteryStatus } from './BatteryStatus';
import { Map, Battery, History } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
  }
}

interface Location {
  lat: number;
  lng: number;
  label?: string;
}

const DroneMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [streetView, setStreetView] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [battery, setBattery] = useState(78);
  const [currentLocation, setCurrentLocation] = useState<Location>({ 
    lat: 19.243386, 
    lng: 72.856141
  });
  
  const locationHistory: Location[] = [
    { lat: 19.243411, lng: 72.855394, label: 'Location 1' },
    { lat: 19.285472, lng: 72.863944, label: 'Location 2' },
    { lat: 19.243386, lng: 72.856141, label: 'Location 3' }
  ];

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAv6YoMixZ-POcCbHx4Af0wvcBcMeZJTFo&callback=initializeMap`;
    script.async = true;
    document.body.appendChild(script);

    // Define the callback function
    window.initializeMap = () => {
      if (mapRef.current) {
        const svService = new window.google.maps.StreetViewService();
        const panorama = new window.google.maps.StreetViewPanorama(
          mapRef.current,
          {
            position: currentLocation,
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            motionTracking: false,
            motionTrackingControl: true,
            fullscreenControl: false,
            addressControl: false,
            showRoadLabels: false,
            panControl: true,
          }
        );
        
        setStreetView(panorama);
        
        // Simulate battery drain
        const batteryInterval = setInterval(() => {
          setBattery(prev => {
            const newLevel = prev - 1;
            return newLevel > 0 ? newLevel : 0;
          });
        }, 60000); // Update every minute
        
        return () => {
          clearInterval(batteryInterval);
          document.body.removeChild(script);
          delete window.initializeMap;
        };
      }
    };
  }, []);

  const goToLocation = (location: Location) => {
    if (streetView) {
      streetView.setPosition({ lat: location.lat, lng: location.lng });
      setCurrentLocation(location);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-drone-dark text-white relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-drone-dark/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Map className="text-drone-accent h-6 w-6" />
          <h1 className="text-xl font-bold">Drone Street View Navigator</h1>
        </div>
        <div className="flex items-center gap-3">
          <BatteryStatus level={battery} />
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            <Map className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            <History className="h-5 w-5" />
          </button>
        </div>
      </header>
      
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full"></div>
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-drone-dark/90 backdrop-blur-md transition-transform duration-300 border-l border-white/10 z-20 overflow-auto",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-drone-light">Current Location</h2>
          <div className="drone-glass p-4 mb-6">
            <div className="text-sm">
              <div className="mb-1 text-gray-400">Latitude</div>
              <div className="font-mono mb-3">{currentLocation.lat.toFixed(6)}°N</div>
              <div className="mb-1 text-gray-400">Longitude</div>
              <div className="font-mono">{currentLocation.lng.toFixed(6)}°E</div>
            </div>
          </div>
          
          <MapHistory 
            locations={locationHistory} 
            currentLocation={currentLocation}
            onSelectLocation={goToLocation}
          />
        </div>
      </div>
      
      {/* Mobile History Drawer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-drone-dark/90 backdrop-blur-md border-t border-white/10 transition-all duration-300 z-30",
        showHistory ? "h-80" : "h-0 overflow-hidden"
      )}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-drone-light">Location History</h2>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <MapHistory 
            locations={locationHistory} 
            currentLocation={currentLocation}
            onSelectLocation={goToLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default DroneMap;
