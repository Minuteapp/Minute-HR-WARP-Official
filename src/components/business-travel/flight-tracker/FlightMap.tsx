
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface FlightMapProps {
  departureCode: string;
  arrivalCode: string;
  status: string;
}

const FlightMap: React.FC<FlightMapProps> = ({ departureCode, arrivalCode, status }) => {
  // In einer echten Anwendung würden Sie hier eine Kartenintegration wie Mapbox verwenden
  // Für diese Demo erstellen wir eine einfache visuelle Darstellung
  
  // Simulierte Koordinaten für Flughäfen
  const airports: Record<string, { name: string, x: number, y: number }> = {
    'FRA': { name: 'Frankfurt', x: 30, y: 40 },
    'MUC': { name: 'München', x: 45, y: 45 },
    'BER': { name: 'Berlin', x: 55, y: 25 },
    'HAM': { name: 'Hamburg', x: 40, y: 20 },
    'CGN': { name: 'Köln', x: 25, y: 35 },
    'DUS': { name: 'Düsseldorf', x: 20, y: 30 },
    'STR': { name: 'Stuttgart', x: 35, y: 55 },
    'LHR': { name: 'London', x: 10, y: 30 },
    'CDG': { name: 'Paris', x: 15, y: 45 },
    'FCO': { name: 'Rom', x: 40, y: 80 },
    'MAD': { name: 'Madrid', x: 10, y: 70 },
    'AMS': { name: 'Amsterdam', x: 25, y: 20 },
    'VIE': { name: 'Wien', x: 60, y: 50 },
    'ZRH': { name: 'Zürich', x: 30, y: 55 },
  };
  
  // Verwende Standardkoordinaten, wenn der Flughafen nicht gefunden wird
  const departure = airports[departureCode] || { name: departureCode, x: 20, y: 40 };
  const arrival = airports[arrivalCode] || { name: arrivalCode, x: 60, y: 40 };
  
  // Berechne den Pfad zwischen den beiden Flughäfen
  const midX = (departure.x + arrival.x) / 2;
  const midY = (departure.y + arrival.y) / 2 - 10; // Bogen nach oben
  
  // Berechne die Position des Flugzeugs basierend auf dem Status
  let planePosition = { x: departure.x, y: departure.y };
  
  if (status === 'in_air') {
    // Platziere das Flugzeug irgendwo entlang des Pfades
    const progress = Math.random(); // Zufälliger Fortschritt zwischen 0 und 1
    planePosition = {
      x: departure.x + (arrival.x - departure.x) * progress,
      y: departure.y + (arrival.y - departure.y) * progress - Math.sin(progress * Math.PI) * 10 // Bogen
    };
  } else if (status === 'landed') {
    planePosition = { x: arrival.x, y: arrival.y };
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative bg-blue-50 border border-blue-100 rounded-lg h-60 w-full overflow-hidden">
          {/* Karte Hintergrund */}
          <div className="absolute inset-0 bg-blue-50">
            {/* Landgrenzen als einfache Linien */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
              <path d="M10,30 Q20,20 30,25 T50,30 T70,40 T90,30" stroke="#e5e7eb" strokeWidth="1" fill="none" />
              <path d="M5,50 Q25,45 45,55 T70,50 T90,55" stroke="#e5e7eb" strokeWidth="1" fill="none" />
              <path d="M10,70 Q30,65 50,75 T75,70 T90,75" stroke="#e5e7eb" strokeWidth="1" fill="none" />
            </svg>
          </div>
          
          {/* Flugpfad */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            <path
              d={`M${departure.x},${departure.y} Q${midX},${midY} ${arrival.x},${arrival.y}`}
              stroke="#6b7280"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              fill="none"
            />
            
            {/* Abflugort */}
            <g>
              <circle cx={departure.x} cy={departure.y} r="3" fill="#3b82f6" />
              <text x={departure.x} y={departure.y - 5} textAnchor="middle" fontSize="6" fill="#1f2937">{departure.name}</text>
              <text x={departure.x} y={departure.y + 10} textAnchor="middle" fontSize="5" fill="#4b5563">{departureCode}</text>
            </g>
            
            {/* Ankunftsort */}
            <g>
              <circle cx={arrival.x} cy={arrival.y} r="3" fill="#ef4444" />
              <text x={arrival.x} y={arrival.y - 5} textAnchor="middle" fontSize="6" fill="#1f2937">{arrival.name}</text>
              <text x={arrival.x} y={arrival.y + 10} textAnchor="middle" fontSize="5" fill="#4b5563">{arrivalCode}</text>
            </g>
            
            {/* Flugzeug */}
            {status === 'in_air' && (
              <g transform={`translate(${planePosition.x}, ${planePosition.y}) rotate(${Math.atan2(arrival.y - departure.y, arrival.x - departure.x) * (180 / Math.PI)})`}>
                <path d="M0,0 L3,1 L3,-1 Z" fill="#0891b2" />
              </g>
            )}
          </svg>
          
          {/* Legende */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-500 flex flex-col gap-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Abflug: {departureCode}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Ankunft: {arrivalCode}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Hinweis: Dies ist eine vereinfachte Darstellung der Flugroute.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightMap;
