import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulierte Wetter-Daten (da keine echte API verfügbar)
    const fetchWeatherData = async () => {
      try {
        // Keine echte Wetter-API konfiguriert - zeige leeren Zustand
        // In einer echten Anwendung würde hier eine Wetter-API aufgerufen
        // Für Produktionszwecke: Konfigurieren Sie einen Wetter-API-Service
        setWeather(null);
      } catch (error) {
        console.error('Fehler beim Laden der Wetter-Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'snowy': return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default: return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'Sonnig';
      case 'cloudy': return 'Bewölkt';
      case 'rainy': return 'Regnerisch';
      case 'snowy': return 'Schnee';
      default: return 'Unbekannt';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 25) return 'text-red-500';
    if (temp >= 15) return 'text-yellow-600';
    if (temp >= 5) return 'text-blue-500';
    return 'text-blue-700';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Wetter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Wetter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center">
            Wetter-Daten nicht verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          Wetter - {weather.location}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className={`text-2xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                {weather.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground">
                {getConditionText(weather.condition)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Cloud className="h-3 w-3 text-muted-foreground" />
            <span>Feuchtigkeit: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3 text-muted-foreground" />
            <span>Wind: {weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};