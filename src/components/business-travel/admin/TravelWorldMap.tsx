import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Filter,
  Maximize2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TravelMapPin {
  id: string;
  travel_request_id: string;
  destination: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  employee_name: string;
  travel_dates: string;
  status: string;
  risk_level: 'low' | 'medium' | 'high';
  metadata: any;
  created_at: string;
}

interface TravelWorldMapProps {
  className?: string;
  isFullScreen?: boolean;
  onFullScreenToggle?: () => void;
}

export const TravelWorldMap = ({ 
  className, 
  isFullScreen = false, 
  onFullScreenToggle 
}: TravelWorldMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPin, setSelectedPin] = useState<TravelMapPin | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    risk_level: 'all',
    department: 'all'
  });

  // Fetch map pins
  const { data: mapPins = [], isLoading } = useQuery({
    queryKey: ['travel-map-pins', filters],
    queryFn: async () => {
      let query = supabase
        .from('travel_map_pins')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.risk_level !== 'all') {
        query = query.eq('risk_level', filters.risk_level);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TravelMapPin[];
    }
  });

  // Group pins by destination for better visualization
  const groupedPins = mapPins.reduce((acc, pin) => {
    const key = pin.destination;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(pin);
    return acc;
  }, {} as Record<string, TravelMapPin[]>);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500 border-red-600';
      case 'medium':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-green-500 border-green-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Globale Reiseübersicht
            <Badge variant="secondary">{mapPins.length} aktive Reisen</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            {onFullScreenToggle && (
              <Button size="sm" variant="outline" onClick={onFullScreenToggle}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
          {/* Simplified World Map Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjBmOWZmIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwaDYwMHYyMDBIMTAweiIgZmlsbD0iIzM0ZDM5OSIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2Zz4=')] bg-cover bg-center opacity-30" />
          
          {/* Travel Pins */}
          <div className="relative h-full p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 h-full">
                {Object.entries(groupedPins).map(([destination, pins], index) => {
                  const mainPin = pins[0];
                  const hasMultiple = pins.length > 1;
                  
                  return (
                    <div
                      key={destination}
                      className="relative cursor-pointer group"
                      style={{
                        gridColumn: `${(index % 4) + 1}`,
                        gridRow: `${Math.floor(index / 4) + 1}`
                      }}
                      onClick={() => setSelectedPin(mainPin)}
                    >
                      {/* Pin Marker */}
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 shadow-lg transition-all group-hover:scale-125",
                        getRiskColor(mainPin.risk_level)
                      )}>
                        {hasMultiple && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                            {pins.length}
                          </div>
                        )}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-white p-2 rounded-lg shadow-lg border min-w-48">
                          <div className="text-sm font-medium">{destination}</div>
                          <div className="text-xs text-muted-foreground">
                            {hasMultiple ? `${pins.length} Reisende` : mainPin.employee_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{mainPin.travel_dates}</div>
                            <Badge 
                            className={cn("mt-1", getStatusColor(mainPin.status))}
                          >
                            {mainPin.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <h4 className="text-xs font-medium mb-2">Risiko-Level</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
                <span>Niedrig</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600"></div>
                <span>Mittel</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
                <span>Hoch</span>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{mapPins.length} Aktive Reisen</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>{Object.keys(groupedPins).length} Destinationen</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>
                  {mapPins.filter(p => p.risk_level === 'high').length} Hochrisiko
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Pin Details */}
        {selectedPin && (
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedPin.destination}</h4>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPin(null)}>
                ×
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Reisender:</span>
                <p className="font-medium">{selectedPin.employee_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Reisezeit:</span>
                <p className="font-medium">{selectedPin.travel_dates}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge className={cn("ml-2", getStatusColor(selectedPin.status))}>
                  {selectedPin.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Risiko:</span>
                <Badge className={cn("ml-2", 
                  selectedPin.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                  selectedPin.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                )}>
                  {selectedPin.risk_level}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                Details anzeigen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};