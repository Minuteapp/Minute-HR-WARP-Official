// Compliance Hub - Standort-Verstoß-Karten
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export interface LocationViolationData {
  location: string;
  count: number;
  trend: number; // positive = mehr Verstöße, negative = weniger
}

interface LocationViolationCardsProps {
  data?: LocationViolationData[];
}

export const LocationViolationCards: React.FC<LocationViolationCardsProps> = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Verstöße nach Standort</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Keine Daten</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getTrendBadgeClass = (trend: number) => {
    if (trend > 0) return 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400';
    if (trend < 0) return 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  const formatTrend = (trend: number) => {
    if (trend > 0) return `+${trend}`;
    if (trend < 0) return `${trend}`;
    return '0';
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Verstöße nach Standort</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.map((item, index) => (
          <Card key={index} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate">{item.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">{item.count}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getTrendBadgeClass(item.trend)}`}>
                  {formatTrend(item.trend)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
