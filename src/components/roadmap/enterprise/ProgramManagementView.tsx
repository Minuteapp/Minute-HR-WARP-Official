import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import { useEnterpriseRoadmap } from '@/hooks/roadmap/useEnterpriseRoadmap';
import { CreateProgramDialog } from './CreateProgramDialog';
import type { Program } from '@/types/enterprise-roadmap.types';

interface ProgramManagementViewProps {
  roadmapId: string;
}

export const ProgramManagementView = ({ roadmapId }: ProgramManagementViewProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { programs, strategicThemes, risks, isLoading } = useEnterpriseRoadmap(roadmapId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return { color: 'text-red-600', icon: AlertTriangle };
      case 'high': return { color: 'text-orange-600', icon: AlertTriangle };
      case 'medium': return { color: 'text-yellow-600', icon: AlertTriangle };
      case 'low': return { color: 'text-green-600', icon: AlertTriangle };
      default: return { color: 'text-gray-600', icon: AlertTriangle };
    }
  };

  const getThemeName = (themeId?: string) => {
    if (!themeId) return 'Kein Thema';
    const theme = strategicThemes.find(t => t.id === themeId);
    return theme?.name || 'Unbekanntes Thema';
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      notation: 'compact'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Programme werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Programm-Management</h2>
          <p className="text-muted-foreground">Verwaltung strategischer Programme und Initiativen</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Programm
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Programme</p>
                <p className="text-2xl font-bold">{programs.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Programme</p>
                <p className="text-2xl font-bold">
                  {programs.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtbudget</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(programs.reduce((sum, p) => sum + p.budget_allocated, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Durchschn. Fortschritt</p>
                <p className="text-2xl font-bold">
                  {programs.length > 0 ? 
                    Math.round(programs.reduce((sum, p) => sum + p.completion_percentage, 0) / programs.length) : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Programme</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Programme, um strategische Initiativen zu verwalten.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erstes Programm erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {programs.map((program) => {
            const budgetUtilization = program.budget_allocated > 0 ? 
              (program.budget_spent / program.budget_allocated) * 100 : 0;
            const riskInfo = getRiskLevel(program.risk_level);
            const RiskIcon = riskInfo.icon;

            return (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{program.name}</CardTitle>
                        <Badge className={getStatusColor(program.status)}>
                          {program.status === 'active' ? 'Aktiv' :
                           program.status === 'planning' ? 'Planung' :
                           program.status === 'completed' ? 'Abgeschlossen' :
                           program.status === 'on_hold' ? 'Pausiert' : 'Archiviert'}
                        </Badge>
                        <Badge className={getPriorityColor(program.priority)}>
                          {program.priority === 'critical' ? 'Kritisch' :
                           program.priority === 'high' ? 'Hoch' :
                           program.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                      {program.description && (
                        <p className="text-muted-foreground mb-2">{program.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Strategisches Thema: {getThemeName(program.strategic_theme_id)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{program.completion_percentage}%</div>
                      <div className="text-sm text-muted-foreground">Fortschritt</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Projektfortschritt</span>
                      <span>{program.completion_percentage}%</span>
                    </div>
                    <Progress value={program.completion_percentage} className="h-2" />
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-semibold">
                          {formatCurrency(program.budget_allocated, program.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">Budget zugeteilt</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">
                          {formatCurrency(program.budget_spent, program.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">Budget verwendet</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-semibold">{Math.round(budgetUtilization)}%</div>
                        <div className="text-xs text-muted-foreground">Budget-Nutzung</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <RiskIcon className={`h-5 w-5 ${riskInfo.color}`} />
                      <div>
                        <div className="font-semibold capitalize">{program.risk_level}</div>
                        <div className="text-xs text-muted-foreground">Risiko-Level</div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline and Location */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {(program.start_date || program.end_date) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {program.start_date && program.end_date ? 
                          `${new Date(program.start_date).toLocaleDateString('de-DE')} - ${new Date(program.end_date).toLocaleDateString('de-DE')}` :
                          program.start_date ? `Start: ${new Date(program.start_date).toLocaleDateString('de-DE')}` :
                          `Ende: ${new Date(program.end_date!).toLocaleDateString('de-DE')}`
                        }
                      </div>
                    )}
                    
                    {program.region && (
                      <div className="flex items-center gap-1">
                        <span>Region: {program.region}</span>
                      </div>
                    )}
                    
                    {program.business_unit && (
                      <div className="flex items-center gap-1">
                        <span>Business Unit: {program.business_unit}</span>
                      </div>
                    )}
                  </div>

                  {/* Stakeholders */}
                  {program.stakeholders && program.stakeholders.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Stakeholder</span>
                      </div>
                      <div className="flex gap-2">
                        {program.stakeholders.slice(0, 5).map((stakeholder: any, index: number) => (
                          <Avatar key={index} className="h-8 w-8">
                            <AvatarImage src={stakeholder.avatar} />
                            <AvatarFallback className="text-xs">
                              {stakeholder.name?.substring(0, 2).toUpperCase() || 'ST'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {program.stakeholders.length > 5 && (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            +{program.stakeholders.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ESG Impact */}
                  {program.esg_impact && Object.keys(program.esg_impact).length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">ESG-Auswirkungen</div>
                      <div className="flex gap-2">
                        {Object.entries(program.esg_impact).slice(0, 3).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateProgramDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Data wird automatisch über React Query aktualisiert
        }}
      />
    </div>
  );
};