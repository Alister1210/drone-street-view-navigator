
import React from 'react';
import { WeatherData, getWeatherIconUrl } from '@/services/weatherService';
import { Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="drone-glass p-4 animate-pulse">
        <div className="h-6 w-2/3 bg-white/10 mb-4 rounded-md"></div>
        <div className="h-12 w-full bg-white/10 mb-2 rounded-md"></div>
        <div className="h-8 w-1/2 bg-white/10 rounded-md"></div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="drone-glass p-4">
        <p className="text-drone-light">Weather data unavailable</p>
      </div>
    );
  }

  return (
    <div className="drone-glass p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-drone-light">Current Weather</h3>
        <div className="flex items-center">
          <img 
            src={getWeatherIconUrl(weatherData.weather[0].icon)} 
            alt={weatherData.weather[0].description}
            className="w-12 h-12"
          />
          <span className="ml-1 text-white capitalize">{weatherData.weather[0].description}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-center">
          <Thermometer className="h-5 w-5 text-drone-accent mr-2" />
          <div>
            <div className="text-sm text-gray-400">Temperature</div>
            <div className="font-mono">{Math.round(weatherData.main.temp)}°C</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Thermometer className="h-5 w-5 text-drone-warning mr-2" />
          <div>
            <div className="text-sm text-gray-400">Feels Like</div>
            <div className="font-mono">{Math.round(weatherData.main.feels_like)}°C</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Droplets className="h-5 w-5 text-drone-light mr-2" />
          <div>
            <div className="text-sm text-gray-400">Humidity</div>
            <div className="font-mono">{weatherData.main.humidity}%</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Wind className="h-5 w-5 text-drone-light mr-2" />
          <div>
            <div className="text-sm text-gray-400">Wind</div>
            <div className="font-mono">{weatherData.wind.speed} m/s</div>
          </div>
        </div>
        
        <div className="flex items-center col-span-2">
          <Eye className="h-5 w-5 text-drone-light mr-2" />
          <div>
            <div className="text-sm text-gray-400">Visibility</div>
            <div className="font-mono">{(weatherData.visibility / 1000).toFixed(1)} km</div>
          </div>
        </div>
      </div>
    </div>
  );
};
