
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Wifi, Clock, Settings } from "lucide-react";
import { useLocationZones } from "@/hooks/location-zones/useLocationZones";

interface SmartZoneDetectionProps {
  onStartTracking?: () => void;
  onStopTracking?: () => void;
  onManageZones?: () => void;
}

const SmartZoneDetection = ({ 
  onStartTracking, 
  onStopTracking, 
  onManageZones 
}: SmartZoneDetectionProps) => {
  const {
    currentDetection,
    currentLocation,
    detectedNetworks,
    recentEvents,
    isLoading
  } = useLocationZones();

  const getDetectionIcon = () => {
    if (!currentDetection) return <MapPin className="h-4 w-4 text-gray-400" />;
    
    return currentDetection.detection_method === 'wifi' 
      ? <Wifi className="h-4 w-4 text-green-600" />
      : <MapPin className="h-4 w-4 text-blue-600" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Standort wird erkannt...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getDetectionIcon()}
          Smart Zone Detection
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-6 w-6 p-0"
            onClick={onManageZones}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentDetection ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {currentDetection.zone.name}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${
                    currentDetection.zone.type === 'office' ? 'border-blue-200 text-blue-700' :
                    currentDetection.zone.type === 'home' ? 'border-green-200 text-green-700' :
                    'border-purple-200 text-purple-700'
                  }`}>
                    {currentDetection.zone.type === 'office' ? 'Büro' :
                     currentDetection.zone.type === 'home' ? 'Home Office' :
                     currentDetection.zone.type === 'client' ? 'Kunde' : 'Unterwegs'}
                  </Badge>
                  <span>•</span>
                  <span>{currentDetection.detection_method === 'wifi' ? 'WLAN' : 'GPS'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${getConfidenceColor(currentDetection.confidence)}`}></div>
                <span className="text-xs text-gray-500">
                  {currentDetection.confidence.toFixed(0)}%
                </span>
              </div>
            </div>

            {currentDetection.distance && (
              <div className="text-xs text-gray-500">
                Entfernung: {currentDetection.distance.toFixed(0)}m
              </div>
            )}

            {currentDetection.wifi_network && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {currentDetection.wifi_network}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {currentDetection.zone.auto_start_tracking ? (
                <Badge variant="success" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Auto-Start aktiv
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={onStartTracking}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Zeit starten
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-500 text-sm mb-2">
              Keine Zone erkannt
            </div>
            {currentLocation && (
              <div className="text-xs text-gray-400">
                GPS: {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
              </div>
            )}
            {detectedNetworks.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                WLAN: {detectedNetworks.join(', ')}
              </div>
            )}
          </div>
        )}

        {recentEvents.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Letzte Aktivitäten:</div>
            <div className="space-y-1">
              {recentEvents.slice(0, 2).map((event) => (
                <div key={event.id} className="text-xs text-gray-600 flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    event.event_type === 'enter' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>
                    {event.event_type === 'enter' ? 'Betreten' : 'Verlassen'} • 
                    {new Date(event.timestamp).toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartZoneDetection;
