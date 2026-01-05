
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Calendar,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useOptimizedProjects } from '@/hooks/projects/useOptimizedProjects';

const MobileProjectDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { projects, isLoading, projectStats } = useOptimizedProjects({
    search: searchQuery,
    status: statusFilter
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'on_hold': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'completed': return 'Abgeschlossen';
      case 'pending': return 'Geplant';
      case 'on_hold': return 'Pausiert';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b px-3 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Projekte</h1>
            <p className="text-[11px] text-gray-600">{projects.length} Projekte</p>
          </div>
          <Button size="sm" className="h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Neu
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
          <Input
            placeholder="Projekte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-[11px]"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="text-center p-1.5 bg-blue-50 rounded-lg">
            <div className="text-[14px] font-bold text-blue-600">{projectStats.active}</div>
            <div className="text-[9px] text-gray-600">Aktiv</div>
          </div>
          <div className="text-center p-1.5 bg-green-50 rounded-lg">
            <div className="text-[14px] font-bold text-green-600">{projectStats.completed}</div>
            <div className="text-[9px] text-gray-600">Fertig</div>
          </div>
          <div className="text-center p-1.5 bg-orange-50 rounded-lg">
            <div className="text-[14px] font-bold text-orange-600">{projectStats.delayed}</div>
            <div className="text-[9px] text-gray-600">Verzögert</div>
          </div>
          <div className="text-center p-1.5 bg-purple-50 rounded-lg">
            <div className="text-[14px] font-bold text-purple-600">{projectStats.avgProgress.toFixed(0)}%</div>
            <div className="text-[9px] text-gray-600">Ø Fortschritt</div>
          </div>
        </div>
      </div>

      {/* Project List */}
      <div className="p-3 space-y-2.5">
        {projects.map((project) => (
          <Card key={project.id} className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[11px] truncate">{project.name}</h3>
                  <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">
                    {project.description || 'Keine Beschreibung'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Badge 
                    variant="outline"
                    className={`text-[9px] ${getPriorityColor(project.priority)}`}
                  >
                    {project.priority === 'high' ? 'Hoch' : 
                     project.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Status and Progress */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(project.status)}`} />
                  <span className="text-[10px] text-gray-600">{getStatusText(project.status)}</span>
                </div>
                <span className="text-[10px] font-medium">{project.progress || 0}%</span>
              </div>
              
              <Progress value={project.progress || 0} className="h-1 mb-2" />

              {/* Project Details */}
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5 text-gray-400" />
                  <span className="text-gray-600 truncate">
                    {project.dueDate ? 
                      new Date(project.dueDate).toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      }) : 
                      'Kein Datum'
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <DollarSign className="h-2.5 w-2.5 text-gray-400" />
                  <span className="text-gray-600 truncate">
                    {project.budget ? 
                      `€${(project.budget / 1000).toFixed(0)}K` : 
                      'Kein Budget'
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5 text-gray-400" />
                  <span className="text-gray-600">
                    {project.teamMembers?.length || 0}
                  </span>
                </div>
              </div>

              {/* Risk Indicator */}
              {project.status === 'active' && project.dueDate && (
                (() => {
                  const daysUntilDeadline = Math.ceil(
                    (new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isRisk = daysUntilDeadline < 7 || (project.progress || 0) < 25;
                  
                  return isRisk ? (
                    <div className="flex items-center gap-1 mt-1.5 p-1.5 bg-red-50 rounded text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
                      <span className="text-red-700">
                        {daysUntilDeadline < 7 ? 
                          `Deadline in ${daysUntilDeadline} Tagen` : 
                          'Niedriger Fortschritt'
                        }
                      </span>
                    </div>
                  ) : null;
                })()
              )}
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-10">
            <Target className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-[13px] font-medium text-gray-900 mb-1.5">Keine Projekte gefunden</h3>
            <p className="text-[11px] text-gray-600 mb-3">
              {searchQuery ? 'Keine Projekte entsprechen Ihrer Suche.' : 'Erstellen Sie Ihr erstes Projekt.'}
            </p>
            <Button size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Neues Projekt
            </Button>
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20" />
    </div>
  );
};

export default MobileProjectDashboard;
