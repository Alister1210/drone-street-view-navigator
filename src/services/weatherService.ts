
import { toast } from "@/components/ui/sonner";

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  visibility: number;
  sys: {
    country: string;
  };
}

export const fetchWeatherData = async (lat: number, lng: number): Promise<WeatherData | null> => {
  try {
    const API_KEY = "8906c79ab021e889971b797fd243408a";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    toast.error("Failed to fetch weather data");
    return null;
  }
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
