
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationIndicatorProps {
  address: string | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  onRefresh: () => void;
}

const LocationIndicator = ({ 
  address, 
  loading, 
  error, 
  permissionDenied,
  onRefresh 
}: LocationIndicatorProps) => {
  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <MapPin className="h-4 w-4" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="flex items-center space-x-2 text-sm text-amber-500">
        <MapPin className="h-4 w-4" />
        <span>Standort-Zugriff verweigert</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={() => window.open('about:settings', '_blank')}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-500">
        <MapPin className="h-4 w-4" />
        <span>Standort konnte nicht ermittelt werden</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onRefresh}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <MapPin className="h-4 w-4" />
      <span>{address || 'Standort unbekannt'}</span>
    </div>
  );
};

export default LocationIndicator;
