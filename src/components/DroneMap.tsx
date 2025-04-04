import React, { useEffect, useRef, useState } from 'react';
import { MapHistory } from './MapHistory';
import { BatteryStatus } from './BatteryStatus';
import { WeatherDisplay } from './WeatherDisplay';
import { fetchWeatherData, WeatherData } from '@/services/weatherService';
import { Map, Battery, History, Cloud, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
    initializeMap: () => void;
  }
}

interface Location {
  lat: number;
  lng: number;
  label?: string;
}

const DroneMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [streetView, setStreetView] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [battery, setBattery] = useState(78);
  const [currentLocation, setCurrentLocation] = useState<Location>({ 
    lat: 19.243386, 
    lng: 72.856141
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [miniMapInstance, setMiniMapInstance] = useState<any>(null);
  
  const locationHistory: Location[] = [
    { lat: 19.243411, lng: 72.855394, label: 'Location 1' },
    { lat: 19.243385, lng: 72.856292, label: "Location 2" },
    { lat: 19.243386, lng: 72.856141, label: 'Location 3' }
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAv6YoMixZ-POcCbHx4Af0wvcBcMeZJTFo&callback=initializeMap`;
    script.async = true;
    
    window.initializeMap = () => {
      if (mapRef.current) {
        const mapElement = document.createElement('div');
        mapElement.style.width = '100%';
        mapElement.style.height = '300px';
        mapElement.style.marginBottom = '10px';
        mapRef.current.appendChild(mapElement);
        
        const map = new window.google.maps.Map(mapElement, {
          center: currentLocation,
          zoom: 14,
          mapTypeId: 'hybrid',
          mapTypeControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          ]
        });
        
        const marker = new window.google.maps.Marker({
          position: currentLocation,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#64DFDF',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          title: 'Drone Location'
        });
        
        setMapInstance(map);
        
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
        
        map.setStreetView(panorama);
        
        if (miniMapRef.current) {
          const miniMap = new window.google.maps.Map(miniMapRef.current, {
            center: currentLocation,
            zoom: 16,
            mapTypeId: 'roadmap',
            mapTypeControl: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            ]
          });
          
          const miniMapMarker = new window.google.maps.Marker({
            position: currentLocation,
            map: miniMap,
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#64DFDF',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              rotation: 0
            },
            title: 'Drone Location'
          });
          
          setMiniMapInstance(miniMap);
        }
        
        const batteryInterval = setInterval(() => {
          setBattery(prev => {
            const newLevel = prev - 1;
            return newLevel > 0 ? newLevel : 0;
          });
        }, 60000);
        
        loadWeatherData(currentLocation.lat, currentLocation.lng);
        
        return () => {
          clearInterval(batteryInterval);
        };
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window.initializeMap;
    };
  }, []);

  const loadWeatherData = async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchWeatherData(lat, lng);
      setWeatherData(data);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const goToLocation = (location: Location) => {
    if (streetView) {
      streetView.setPosition({ lat: location.lat, lng: location.lng });
      setCurrentLocation(location);
      
      if (mapInstance) {
        mapInstance.setCenter(location);
      }
      
      if (miniMapInstance) {
        miniMapInstance.setCenter(location);
        
        miniMapInstance.markers?.forEach((marker: any) => {
          marker.setPosition(location);
        });
      }
      
      loadWeatherData(location.lat, location.lng);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-drone-dark text-white relative">
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
      
      <div ref={mapRef} className="w-full h-full"></div>
      
      <div className="absolute bottom-4 left-4 w-64 h-64 rounded-lg overflow-hidden border border-white/20 shadow-lg z-20">
        <div ref={miniMapRef} className="w-full h-full"></div>
        <div className="absolute top-2 left-2 bg-drone-dark/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
          <Navigation className="h-3 w-3 text-drone-accent" />
          <span>Google Maps View</span>
        </div>
      </div>
      
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
          
          <h2 className="text-lg font-bold mb-4 text-drone-light flex items-center gap-2">
            <Cloud className="h-5 w-5 text-drone-accent" />
            Weather Information
          </h2>
          <div className="mb-6">
            <WeatherDisplay 
              weatherData={weatherData} 
              isLoading={isLoadingWeather} 
            />
          </div>
          
          <MapHistory 
            locations={locationHistory} 
            currentLocation={currentLocation}
            onSelectLocation={goToLocation}
          />
        </div>
      </div>
      
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
