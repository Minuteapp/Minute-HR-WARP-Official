
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Location {
  name: string;
  count: number;
  x: number;
  y: number;
}

interface ExecutiveWorldMapProps {
  locations?: Location[];
}

export const ExecutiveWorldMap = ({ locations = [] }: ExecutiveWorldMapProps) => {
  // Keine Mock-Daten als Default - wenn keine Locations übergeben werden, wird eine leere Karte angezeigt
  const displayLocations = locations;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Globale Mitarbeiterverteilung</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative w-full h-[400px] bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg overflow-hidden">
          {/* Simplified World Map Background */}
          <svg
            viewBox="0 0 100 60"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Stylized continents */}
            <defs>
              <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            
            {/* North America */}
            <path
              d="M 10 15 Q 15 10 25 12 Q 30 15 28 25 Q 25 35 18 38 Q 12 35 10 25 Z"
              fill="url(#landGradient)"
              opacity="0.7"
            />
            
            {/* South America */}
            <path
              d="M 22 40 Q 28 38 30 45 Q 32 55 28 58 Q 22 55 20 48 Z"
              fill="url(#landGradient)"
              opacity="0.7"
            />
            
            {/* Europe */}
            <path
              d="M 42 12 Q 52 10 55 15 Q 58 20 52 28 Q 45 32 42 25 Q 40 18 42 12 Z"
              fill="url(#landGradient)"
              opacity="0.7"
            />
            
            {/* Africa */}
            <path
              d="M 45 28 Q 52 26 55 35 Q 58 48 50 52 Q 42 50 44 38 Z"
              fill="url(#landGradient)"
              opacity="0.7"
            />
            
            {/* Asia */}
            <path
              d="M 55 8 Q 75 5 85 15 Q 90 25 82 35 Q 70 40 60 35 Q 55 28 55 18 Z"
              fill="url(#landGradient)"
              opacity="0.7"
            />
            
            {/* Australia */}
            <path
              d="M 75 42 Q 88 40 90 50 Q 88 58 78 55 Q 72 50 75 42 Z"
              fill="url(#landGradient)"
              opacity="0.7"
            />
          </svg>

          {/* Location Markers */}
          {displayLocations.map((location, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
            >
              {/* Outer ring animation */}
              <div className="absolute inset-0 w-12 h-12 -m-3 bg-primary/20 rounded-full animate-ping" />
              
              {/* Main marker */}
              <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg border-2 border-white">
                {location.count}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {location.name}: {location.count} Mitarbeiter
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
