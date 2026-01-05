
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Lightbulb, Plus } from 'lucide-react';
import { useInnovation } from '@/hooks/useInnovation';

export const InnovationChannels = () => {
  const { channels, isLoading } = useInnovation();

  if (isLoading) {
    return <div className="p-6">Lade Innovation Channels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Innovation Channels</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neuer Channel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.length === 0 ? (
          <Card className="border-0 shadow-sm col-span-full">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Channels</h3>
              <p className="text-muted-foreground">
                Erstellen Sie Ihren ersten Innovation Channel, um die Zusammenarbeit zu fördern.
              </p>
            </CardContent>
          </Card>
        ) : (
          channels.map((channel: any) => (
            <Card key={channel.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b" style={{ backgroundColor: `${channel.color}10` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${channel.color}20` }}
                    >
                      <div 
                        className="h-5 w-5 rounded"
                        style={{ backgroundColor: channel.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={channel.is_active ? "default" : "secondary"}>
                    {channel.is_active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="text-2xl font-bold text-yellow-600">
                          {channel.ideas_count || 0}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Ideen</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">
                          {channel.pilot_projects_count || 0}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Projekte</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      Channel betreten
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
