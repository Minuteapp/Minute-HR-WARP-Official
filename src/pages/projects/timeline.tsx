
import { Calendar, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

export default function ProjectTimelinePage() {
  const timelineEvents = [
    {
      id: '1',
      title: 'Website Redesign',
      type: 'project',
      date: '2024-01-15',
      status: 'active',
      description: 'Start des Website Redesign Projekts'
    },
    {
      id: '2',
      title: 'Mobile App MVP',
      type: 'milestone',
      date: '2024-02-01',
      status: 'pending',
      description: 'Fertigstellung des ersten MVP'
    },
    {
      id: '3',
      title: 'Backend API v2',
      type: 'project',
      date: '2024-02-15',
      status: 'completed',
      description: 'Neue API Version implementiert'
    },
    {
      id: '4',
      title: 'User Testing Phase',
      type: 'milestone',
      date: '2024-03-01',
      status: 'pending',
      description: 'Umfassende Benutzertests'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Clock className="h-4 w-4" />;
      case 'milestone':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <StandardPageLayout
      title="Projekt-Zeitplan"
      subtitle="Übersicht über alle Projekte und Meilensteine"
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-6">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                    {getTypeIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.date).toLocaleDateString('de-DE')}</span>
                          <span className="capitalize">{event.type}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
