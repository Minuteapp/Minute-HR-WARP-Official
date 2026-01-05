import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Calendar, 
  User, 
  ArrowLeft, 
  Edit3,
  Target,
  Users
} from 'lucide-react';
import { PilotProject } from '@/types/innovation';

interface PilotProjectDetailsProps {
  project: PilotProject;
  onBack: () => void;
  onEdit?: (project: PilotProject) => void;
}

export const PilotProjectDetails = ({ project, onBack, onEdit }: PilotProjectDetailsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'team' | 'timeline'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'pilot_phase': return 'bg-blue-100 text-blue-800';
      case 'scaling': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'preparing': return 'Vorbereitung';
      case 'pilot_phase': return 'Pilotphase';
      case 'scaling': return 'Skalierung';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: Rocket },
    { id: 'metrics', label: 'Kriterien', icon: Target },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'timeline', label: 'Zeit', icon: Calendar }
  ];

  return (
    <div className="w-full max-w-none space-y-4 p-2 sm:p-4">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="hover:bg-muted flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold break-words">{project.title}</h1>
            <p className="text-sm text-muted-foreground break-words">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={`${getStatusColor(project.status)} text-xs`}>
            {getStatusLabel(project.status)}
          </Badge>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              className="text-xs px-2"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Compact Progress Card */}
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg sm:text-xl font-bold text-primary">{project.progress}%</div>
              <p className="text-xs text-muted-foreground">Fortschritt</p>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm font-medium truncate">
                {new Date(project.start_date).toLocaleDateString('de-DE')}
              </div>
              <p className="text-xs text-muted-foreground">Start</p>
            </div>

            {project.budget && (
              <div>
                <div className="text-xs sm:text-sm font-medium truncate">
                  {project.budget.toLocaleString('de-DE')} €
                </div>
                <p className="text-xs text-muted-foreground">Budget</p>
              </div>
            )}

            <div>
              <div className="text-xs sm:text-sm font-medium truncate" title={project.responsible_person}>
                {project.responsible_person}
              </div>
              <p className="text-xs text-muted-foreground">Verantwortlich</p>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={project.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Mobile-First Tabs */}
      <div className="w-full overflow-x-auto">
        <nav className="flex space-x-1 min-w-max px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 py-2 px-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground rounded-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content - Mobile Optimized */}
      <div className="w-full">
        {activeTab === 'overview' && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Projektdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Beschreibung</h4>
                <p className="text-muted-foreground break-words leading-relaxed">{project.description}</p>
              </div>
              
              {project.risk_assessment && (
                <div>
                  <h4 className="font-medium mb-2">Risikobewertung</h4>
                  <p className="text-muted-foreground break-words leading-relaxed">{project.risk_assessment}</p>
                </div>
              )}

              {project.learnings && (
                <div>
                  <h4 className="font-medium mb-2">Erkenntnisse</h4>
                  <p className="text-muted-foreground break-words leading-relaxed">{project.learnings}</p>
                </div>
              )}

              {project.next_steps && (
                <div>
                  <h4 className="font-medium mb-2">Nächste Schritte</h4>
                  <p className="text-muted-foreground break-words leading-relaxed">{project.next_steps}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'metrics' && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Erfolgskriterien</CardTitle>
            </CardHeader>
            <CardContent>
              {project.success_metrics && project.success_metrics.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {project.success_metrics.map((metric, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="break-words">{metric}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Keine Erfolgskriterien definiert.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'team' && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Projektleitung</h4>
                <p className="text-muted-foreground break-words">{project.responsible_person}</p>
              </div>
              
              {project.team_members && project.team_members.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Team-Mitglieder</h4>
                  <ul className="space-y-1">
                    {project.team_members.map((member, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="break-words">{member}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zeitplan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Projektstart</p>
                    <p className="text-muted-foreground break-words">
                      {new Date(project.start_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                
                {project.end_date && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">Geplantes Ende</p>
                      <p className="text-muted-foreground break-words">
                        {new Date(project.end_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Rocket className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Aktueller Status</p>
                    <p className="text-muted-foreground break-words">
                      {getStatusLabel(project.status)} - {project.progress}% abgeschlossen
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};