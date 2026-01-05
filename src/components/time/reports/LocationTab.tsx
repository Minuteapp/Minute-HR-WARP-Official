import { useMemo } from 'react';
import { TimeEntry } from '@/types/time-tracking.types';
import { groupByLocation } from '@/utils/timeReportCalculations';
import LocationPieChart from './charts/LocationPieChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Car, MapPin } from "lucide-react";

interface LocationTabProps {
  data: TimeEntry[];
  period: string;
}

// Icon und Farbe für Arbeitsort
const getLocationStyle = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('büro') || lowerName.includes('office')) {
    return { 
      icon: Building2, 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      barColor: 'bg-blue-500'
    };
  }
  if (lowerName.includes('home') || lowerName.includes('zuhause')) {
    return { 
      icon: Home, 
      bgColor: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      barColor: 'bg-purple-500'
    };
  }
  if (lowerName.includes('unterwegs') || lowerName.includes('mobil') || lowerName.includes('extern')) {
    return { 
      icon: Car, 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      barColor: 'bg-emerald-500'
    };
  }
  return { 
    icon: MapPin, 
    bgColor: 'bg-gray-100', 
    iconColor: 'text-gray-600',
    barColor: 'bg-gray-500'
  };
};

const LocationTab = ({ data }: LocationTabProps) => {
  const locationData = useMemo(() => groupByLocation(data), [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LocationPieChart data={locationData} />
      
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Details nach Arbeitsort</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {locationData.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Keine Standortdaten verfügbar
            </p>
          ) : (
            locationData.map((location, index) => {
              const style = getLocationStyle(location.name);
              const IconComponent = style.icon;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-900">{location.name}</span>
                        <p className="text-xs text-gray-500">{location.hours} Stunden</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {location.percentage}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden ml-13">
                    <div 
                      className={`absolute top-0 left-0 h-full ${style.barColor} rounded-full transition-all`}
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTab;