
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { GlobalMobilityRequest } from '@/types/global-mobility';

interface ExecutiveLocationTagsProps {
  requests: GlobalMobilityRequest[];
}

export const ExecutiveLocationTags = ({ requests }: ExecutiveLocationTagsProps) => {
  // Get unique locations with count
  const locationCounts = requests.reduce((acc, request) => {
    const location = request.destination_location;
    if (location) {
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const locations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const getLocationColor = (index: number): string => {
    const colors = [
      'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Alle Standorte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {locations.length > 0 ? (
            locations.map(([location, count], index) => (
              <Badge 
                key={location} 
                variant="secondary"
                className={`${getLocationColor(index)} px-3 py-1`}
              >
                {location} ({count})
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Keine Standorte verfügbar</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
