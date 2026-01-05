
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Route, MapPin, Clock, Euro, Leaf } from 'lucide-react';
import { useIntelligentFeatures, OptimalRoute } from '@/hooks/business-travel/useIntelligentFeatures';

const RouteOptimizer: React.FC = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<OptimalRoute[]>([]);
  const { generateOptimalRoutes, isAnalyzing } = useIntelligentFeatures();

  const handleOptimizeRoutes = async () => {
    if (!startLocation || !destination) return;
    
    const optimizedRoutes = await generateOptimalRoutes(destination, startLocation);
    setRoutes(optimizedRoutes);
  };

  const getRouteTypeIcon = (route: OptimalRoute) => {
    if (route.estimatedTime.includes('6h')) return <Leaf className="h-4 w-4 text-green-600" />;
    if (route.estimatedTime.includes('4h')) return <Route className="h-4 w-4 text-blue-600" />;
    return <MapPin className="h-4 w-4 text-purple-600" />;
  };

  const getRouteTypeLabel = (route: OptimalRoute) => {
    if (route.estimatedTime.includes('6h')) return 'Bahn';
    if (route.estimatedTime.includes('4h')) return 'Flug mit Stopp';
    return 'Direktflug';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Optimale Reiserouten-Vorschläge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Startort</Label>
              <Input
                id="start"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="z.B. München"
              />
            </div>
            <div>
              <Label htmlFor="destination">Zielort</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="z.B. Berlin"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleOptimizeRoutes}
            disabled={isAnalyzing || !startLocation || !destination}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analysiere Routen...
              </>
            ) : (
              'Optimale Routen finden'
            )}
          </Button>
        </CardContent>
      </Card>

      {routes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Empfohlene Routen</h3>
          {routes.map((route, index) => (
            <Card key={route.id} className={index === 0 ? 'ring-2 ring-green-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRouteTypeIcon(route)}
                    <CardTitle className="text-base">
                      {getRouteTypeLabel(route)}
                    </CardTitle>
                    {index === 0 && (
                      <Badge variant="default" className="bg-green-500">
                        Empfohlen
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    -{route.co2Savings}% CO₂
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{route.estimatedCost}€</p>
                      <p className="text-xs text-gray-500">Kosten</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{route.estimatedTime}</p>
                      <p className="text-xs text-gray-500">Reisezeit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">-{route.co2Savings}%</p>
                      <p className="text-xs text-gray-500">CO₂ Ersparnis</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Route:</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {route.route.map((stop, i) => (
                      <React.Fragment key={i}>
                        <span>{stop}</span>
                        {i < route.route.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Vorteile:</p>
                  <div className="flex flex-wrap gap-1">
                    {route.recommendations.map((rec, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full mt-3">
                  Diese Route auswählen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer;
