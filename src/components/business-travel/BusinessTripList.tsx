
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, User, Euro, Clock } from "lucide-react";
import { BusinessTrip } from "@/types/business-travel";
import { useNavigate } from "react-router-dom";

interface BusinessTripListProps {
  trips: BusinessTrip[];
  isLoading: boolean;
  onTripSelect?: (trip: BusinessTrip) => void;
}

const BusinessTripList: React.FC<BusinessTripListProps> = ({ 
  trips, 
  isLoading, 
  onTripSelect 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'pending': return 'Ausstehend';
      case 'rejected': return 'Abgelehnt';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Nicht angegeben';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleTripClick = (trip: BusinessTrip) => {
    onTripSelect?.(trip);
    navigate(`/business-travel/${trip.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Geschäftsreisen vorhanden
        </h3>
        <p className="text-gray-500 mb-4">
          Erstellen Sie Ihre erste Geschäftsreise
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <Card 
          key={trip.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleTripClick(trip)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{trip.destination}</CardTitle>
                  <p className="text-sm text-gray-600">{trip.purpose}</p>
                </div>
              </div>
              <Badge className={getStatusColor(trip.status)}>
                {getStatusText(trip.status)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{trip.employee_name}</p>
                  <p className="text-xs text-gray-500">{trip.department}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">
                    {new Date(trip.start_date).toLocaleDateString('de-DE')}
                  </p>
                  <p className="text-xs text-gray-500">
                    bis {new Date(trip.end_date).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">
                    {formatCurrency(trip.estimated_cost)}
                  </p>
                  <p className="text-xs text-gray-500">Geschätzt</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium capitalize">{trip.transport}</p>
                  <p className="text-xs text-gray-500">Transport</p>
                </div>
              </div>
            </div>
            
            {trip.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                {trip.notes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTripClick(trip);
                }}
              >
                Details anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BusinessTripList;
