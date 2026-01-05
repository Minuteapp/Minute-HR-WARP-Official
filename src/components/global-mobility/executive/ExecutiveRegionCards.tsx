
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalMobilityRequest } from '@/types/global-mobility';

interface ExecutiveRegionCardsProps {
  requests: GlobalMobilityRequest[];
}

interface RegionData {
  name: string;
  count: number;
  locations: string[];
  color: string;
}

export const ExecutiveRegionCards = ({ requests }: ExecutiveRegionCardsProps) => {
  // Calculate region data from requests
  const calculateRegions = (): RegionData[] => {
    const regionMap: Record<string, { count: number; locations: Set<string> }> = {
      'EMEA': { count: 0, locations: new Set() },
      'APAC': { count: 0, locations: new Set() },
      'Americas': { count: 0, locations: new Set() }
    };

    const emeaCountries = ['germany', 'uk', 'france', 'spain', 'italy', 'netherlands', 'belgium', 'austria', 'switzerland', 'poland', 'sweden', 'norway', 'denmark', 'finland', 'ireland', 'portugal', 'czech', 'hungary', 'romania', 'dubai', 'uae', 'saudi', 'south africa', 'nigeria', 'kenya', 'egypt', 'london', 'frankfurt', 'paris', 'berlin', 'munich', 'amsterdam', 'brussels', 'vienna', 'zurich', 'stockholm', 'copenhagen', 'oslo', 'helsinki', 'dublin', 'madrid', 'barcelona', 'milan', 'rome', 'warsaw', 'prague', 'budapest'];
    const apacCountries = ['china', 'japan', 'korea', 'singapore', 'hong kong', 'taiwan', 'india', 'australia', 'new zealand', 'indonesia', 'malaysia', 'thailand', 'vietnam', 'philippines', 'shanghai', 'beijing', 'tokyo', 'seoul', 'sydney', 'melbourne', 'mumbai', 'delhi', 'bangalore', 'bangkok', 'jakarta', 'manila', 'kuala lumpur', 'auckland'];
    const americasCountries = ['usa', 'united states', 'canada', 'mexico', 'brazil', 'argentina', 'chile', 'colombia', 'peru', 'new york', 'san francisco', 'los angeles', 'chicago', 'boston', 'seattle', 'miami', 'houston', 'toronto', 'vancouver', 'montreal', 'sao paulo', 'rio', 'buenos aires', 'mexico city'];

    requests.forEach(request => {
      const location = (request.destination_location || '').toLowerCase();
      if (!location) return;

      if (emeaCountries.some(c => location.includes(c))) {
        regionMap['EMEA'].count++;
        regionMap['EMEA'].locations.add(request.destination_location || '');
      } else if (apacCountries.some(c => location.includes(c))) {
        regionMap['APAC'].count++;
        regionMap['APAC'].locations.add(request.destination_location || '');
      } else if (americasCountries.some(c => location.includes(c))) {
        regionMap['Americas'].count++;
        regionMap['Americas'].locations.add(request.destination_location || '');
      }
    });

    return [
      { name: 'EMEA', count: regionMap['EMEA'].count, locations: Array.from(regionMap['EMEA'].locations).slice(0, 5), color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
      { name: 'APAC', count: regionMap['APAC'].count, locations: Array.from(regionMap['APAC'].locations).slice(0, 5), color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
      { name: 'Americas', count: regionMap['Americas'].count, locations: Array.from(regionMap['Americas'].locations).slice(0, 5), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    ];
  };

  const regions = calculateRegions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {regions.map((region) => (
        <Card key={region.name}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{region.name}</span>
              <Badge variant="secondary" className={region.color}>
                {region.count} Aktiv
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {region.locations.length > 0 ? (
                region.locations.map((location) => (
                  <Badge key={location} variant="outline" className="text-xs">
                    {location}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Keine aktiven Standorte</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
