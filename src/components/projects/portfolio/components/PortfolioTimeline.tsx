
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  progress: number;
}

interface PortfolioTimelineProps {
  projects: Project[];
}

export const PortfolioTimeline: React.FC<PortfolioTimelineProps> = ({ projects }) => {
  const getTimelineData = () => {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    const sixMonthsAhead = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 30);

    return projects
      .filter(p => p.start_date || p.end_date)
      .map(project => {
        const startDate = project.start_date ? new Date(project.start_date) : null;
        const endDate = project.end_date ? new Date(project.end_date) : null;
        
        return {
          ...project,
          startDate,
          endDate,
          duration: startDate && endDate ? 
            Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : null
        };
      })
      .sort((a, b) => {
        if (a.startDate && b.startDate) {
          return a.startDate.getTime() - b.startDate.getTime();
        }
        return 0;
      });
  };

  const timelineData = getTimelineData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'completed': return 'Abgeschlossen';
      case 'pending': return 'Geplant';
      case 'on_hold': return 'Pausiert';
      default: return status;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nicht festgelegt';
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const isOverdue = (project: any) => {
    if (!project.endDate || project.status === 'completed') return false;
    return project.endDate < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Portfolio-Timeline</h2>
        <div className="text-sm text-muted-foreground">
          {timelineData.length} Projekte mit Terminen
        </div>
      </div>

      <div className="space-y-4">
        {timelineData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Keine Projekte mit Terminen gefunden
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {timelineData.map((project, index) => (
              <div key={project.id} className="relative flex items-start space-x-4 pb-8">
                {/* Timeline Dot */}
                <div className={`
                  relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white
                  ${isOverdue(project) ? 'border-red-500' : 'border-primary'}
                `}>
                  <div className={`
                    w-3 h-3 rounded-full
                    ${isOverdue(project) ? 'bg-red-500' : 'bg-primary'}
                  `}></div>
                </div>

                {/* Project Card */}
                <Card className={`flex-1 ${isOverdue(project) ? 'border-red-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                          {isOverdue(project) && (
                            <Badge className="bg-red-100 text-red-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Überfällig
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Fortschritt: {project.progress}%</div>
                        {project.duration && (
                          <div>{project.duration} Tage</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground">Startdatum</div>
                        <div>{formatDate(project.startDate)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Enddatum</div>
                        <div className={isOverdue(project) ? 'text-red-600 font-medium' : ''}>
                          {formatDate(project.endDate)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                        <span>Fortschritt</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            project.progress === 100 ? 'bg-green-500' :
                            isOverdue(project) ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
