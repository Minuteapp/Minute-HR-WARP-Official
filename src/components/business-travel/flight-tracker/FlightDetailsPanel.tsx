
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, MapPin, Plus } from "lucide-react";
import { FlightDetails } from "@/types/business-travel";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface FlightDetailsPanelProps {
  flights: FlightDetails[];
  isLoading: boolean;
  onAddFlight: () => void;
  onEditFlight: (flight: FlightDetails) => void;
}

export const FlightDetailsPanel = ({ 
  flights, 
  isLoading, 
  onAddFlight, 
  onEditFlight 
}: FlightDetailsPanelProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Geplant</Badge>;
      case 'delayed':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Verspätet</Badge>;
      case 'in_air':
        return <Badge variant="outline" className="bg-green-50 text-green-700">In der Luft</Badge>;
      case 'landed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Gelandet</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: de });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd. MMM yyyy", { locale: de });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Flugdetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Flugdetails
          </CardTitle>
          <Button onClick={onAddFlight} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Flug hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {flights.length === 0 ? (
          <div className="text-center py-8">
            <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Flugdetails vorhanden</h3>
            <p className="text-muted-foreground mb-4">
              Fügen Sie Flugdetails für Ihre Geschäftsreise hinzu.
            </p>
            <Button onClick={onAddFlight}>
              <Plus className="h-4 w-4 mr-2" />
              Ersten Flug hinzufügen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight) => (
              <div 
                key={flight.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onEditFlight(flight)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {flight.airline} {flight.flight_number}
                    </span>
                    {flight.is_return_flight && (
                      <Badge variant="secondary">Rückflug</Badge>
                    )}
                  </div>
                  {getStatusBadge(flight.status)}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="font-medium text-lg">{flight.departure_airport}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(flight.departure_time)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(flight.departure_time)}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="flex items-center">
                      <div className="h-px w-8 bg-gray-300"></div>
                      <Plane className="h-4 w-4 mx-2 text-primary" />
                      <div className="h-px w-8 bg-gray-300"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-lg">{flight.arrival_airport}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(flight.arrival_time)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(flight.arrival_time)}
                    </div>
                  </div>
                </div>
                
                {flight.delay_minutes && flight.delay_minutes > 0 && (
                  <div className="mt-3 flex items-center text-yellow-600 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Verspätung: {flight.delay_minutes} Minuten
                  </div>
                )}
                
                {(flight.terminal || flight.gate) && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    {flight.terminal && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Terminal {flight.terminal}
                      </div>
                    )}
                    {flight.gate && (
                      <div>Gate {flight.gate}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
