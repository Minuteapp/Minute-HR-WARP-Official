import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useEnterpriseRoadmap } from '@/hooks/roadmap/useEnterpriseRoadmap';
import { CreateStrategicThemeDialog } from './CreateStrategicThemeDialog';
import type { StrategicTheme } from '@/types/enterprise-roadmap.types';

interface StrategicThemesViewProps {
  roadmapId: string;
}

export const StrategicThemesView = ({ roadmapId }: StrategicThemesViewProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { strategicThemes, programs, isLoading } = useEnterpriseRoadmap(roadmapId);

  const getThemeProgress = (themeId: string) => {
    const themePrograms = programs.filter(p => p.strategic_theme_id === themeId);
    if (themePrograms.length === 0) return 0;
    
    const totalProgress = themePrograms.reduce((sum, program) => sum + program.completion_percentage, 0);
    return Math.round(totalProgress / themePrograms.length);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Strategische Themen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Strategische Themen</h2>
          <p className="text-muted-foreground">Übergeordnete strategische Ziele und Initiativen</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Thema
        </Button>
      </div>

      {strategicThemes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine strategischen Themen</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie strategische Themen, um Ihre Roadmap zu strukturieren.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erstes Thema erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {strategicThemes.map((theme) => {
            const progress = getThemeProgress(theme.id);
            const themePrograms = programs.filter(p => p.strategic_theme_id === theme.id);
            const totalBudget = themePrograms.reduce((sum, p) => sum + p.budget_allocated, 0);
            const spentBudget = themePrograms.reduce((sum, p) => sum + p.budget_spent, 0);

            return (
              <Card key={theme.id} className="border-l-4" style={{ borderLeftColor: theme.color }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{theme.name}</CardTitle>
                        <Badge className={getStatusColor(theme.status)}>
                          {theme.status === 'active' ? 'Aktiv' : 
                           theme.status === 'completed' ? 'Abgeschlossen' :
                           theme.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                        </Badge>
                      </div>
                      {theme.description && (
                        <p className="text-muted-foreground">{theme.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{progress}%</div>
                      <div className="text-sm text-muted-foreground">Fortschritt</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Gesamtfortschritt</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">{themePrograms.length}</div>
                        <div className="text-xs text-muted-foreground">Programme</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-semibold">
                          {new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                            notation: 'compact'
                          }).format(totalBudget)}
                        </div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-semibold">
                          {totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Budget verwendet</div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {(theme.start_date || theme.end_date) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Start: {theme.start_date ? new Date(theme.start_date).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Ende: {theme.end_date ? new Date(theme.end_date).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                      </div>
                    </div>
                  )}

                  {/* ESG Metrics Preview */}
                  {theme.esg_metrics && Object.keys(theme.esg_metrics).length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">ESG-Auswirkungen</div>
                      <div className="flex gap-2">
                        {Object.entries(theme.esg_metrics).slice(0, 3).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Alignment */}
                  {theme.strategic_alignment && Object.keys(theme.strategic_alignment).length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">Strategische Ausrichtung</div>
                      <div className="flex gap-2">
                        {Object.entries(theme.strategic_alignment).slice(0, 3).map(([key, value]) => (
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

      <CreateStrategicThemeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Data wird automatisch über React Query aktualisiert
        }}
      />
    </div>
  );
};