import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, DoorOpen, Monitor, Car, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CalendarResources = () => {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['calendar-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_resources')
        .select('*')
        .order('resource_type');

      if (error) throw error;
      return data;
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'room': return <DoorOpen className="h-5 w-5" />;
      case 'equipment': return <Monitor className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'machine': return <Wrench className="h-5 w-5" />;
      default: return <DoorOpen className="h-5 w-5" />;
    }
  };

  type ResourceGroup = Record<string, Array<{
    id: string;
    resource_name: string;
    resource_type: string;
    location?: string;
    is_available: boolean;
    capacity?: number;
    metadata?: Record<string, any>;
  }>>;

  const groupedResources = resources?.reduce((acc, resource) => {
    if (!acc[resource.resource_type]) {
      acc[resource.resource_type] = [];
    }
    acc[resource.resource_type].push(resource);
    return acc;
  }, {} as ResourceGroup);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Ressourcen & Buchungen</h2>
          <p className="text-muted-foreground">
            Räume, Geräte, Fahrzeuge und Maschinen verwalten
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Ressource
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Lädt Ressourcen...</div>
      ) : groupedResources && Object.keys(groupedResources).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([type, items]: [string, ResourceGroup[string]]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getResourceIcon(type)}
                  {type === 'room' && 'Räume'}
                  {type === 'equipment' && 'Geräte'}
                  {type === 'vehicle' && 'Fahrzeuge'}
                  {type === 'machine' && 'Maschinen'}
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{resource.resource_name}</div>
                          {resource.location && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {resource.location}
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant={resource.is_available ? 'default' : 'destructive'}
                        >
                          {resource.is_available ? 'Verfügbar' : 'Belegt'}
                        </Badge>
                      </div>
                      {resource.capacity && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Kapazität: {resource.capacity}
                        </div>
                      )}
                      {resource.metadata && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {Object.entries(resource.metadata as Record<string, any>).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Buchen
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <DoorOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine Ressourcen vorhanden</p>
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Erste Ressource erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarResources;