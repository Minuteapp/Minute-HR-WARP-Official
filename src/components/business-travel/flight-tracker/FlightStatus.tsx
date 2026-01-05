
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlightDetails } from "@/types/business-travel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Plane, Clock, Calendar, ArrowRight, AlertTriangle } from "lucide-react";

interface FlightStatusProps {
  flightData: FlightDetails;
}

const FlightStatus: React.FC<FlightStatusProps> = ({ flightData }) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: de });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd. MMMM yyyy", { locale: de });
  };
  
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Geplant</Badge>;
      case "delayed":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Verspätet</Badge>;
      case "in_air":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In der Luft</Badge>;
      case "landed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Gelandet</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <p className="text-lg font-bold">{flightData.airline} {flightData.flight_number}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(flightData.departure_time)}</span>
            </div>
          </div>
          
          <StatusBadge status={flightData.status} />
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold">{flightData.departure_airport}</p>
            <p className="text-sm text-muted-foreground">{formatTime(flightData.departure_time)}</p>
          </div>
          
          <div className="py-4 md:py-0">
            <div className="flex items-center px-4">
              <div className="h-px w-8 md:w-16 bg-gray-300"></div>
              <Plane className="h-5 w-5 mx-2 text-primary" />
              <div className="h-px w-8 md:w-16 bg-gray-300"></div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1">Flugdauer: ~2h</p>
          </div>
          
          <div className="text-center flex-1">
            <p className="text-2xl font-bold">{flightData.arrival_airport}</p>
            <p className="text-sm text-muted-foreground">{formatTime(flightData.arrival_time)}</p>
          </div>
        </div>
        
        {flightData.delay_minutes && flightData.delay_minutes > 0 && (
          <div className="mt-4 flex items-center text-yellow-600 bg-yellow-50 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Verspätung</p>
              <p className="text-sm">Der Flug hat eine Verspätung von {flightData.delay_minutes} Minuten.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlightStatus;
