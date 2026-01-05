import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCareerData } from '@/hooks/employee-tabs/useCareerData';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { CareerEntryDialog } from '../dialogs/CareerEntryDialog';
import { TrendingUp, Target, Award, ArrowRight, Plus, Edit, Trash2 } from 'lucide-react';

interface CareerTabContentNewProps {
  employeeId: string;
}

export const CareerTabContentNew: React.FC<CareerTabContentNewProps> = ({ employeeId }) => {
  const { talentPoolStatus, careerPath, careerGoals, competencyGaps, isLoading } = useCareerData(employeeId);
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const handleCreate = async (data: any) => {
    // Career entry creation logic would go here
    console.log('Create career entry:', data);
  };

  const handleEdit = async (data: any) => {
    // Career entry update logic would go here
    console.log('Update career entry:', data);
  };

  const openCreateDialog = () => {
    setSelectedEntry(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (entry: any) => {
    setSelectedEntry(entry);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Karrieredaten...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Karriereentwicklung
        </h2>
        {canCreate('employee_career') && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Karrierestation hinzufügen
          </Button>
        )}
      </div>

      {/* Talentpool Status */}
      {talentPoolStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Talentpool Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={talentPoolStatus.status === 'high_potential' ? 'default' : 'secondary'}>
                {talentPoolStatus.status === 'high_potential' ? '⭐ High Potential' : 'Talentpool Mitglied'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Seit: {new Date(talentPoolStatus.added_date).toLocaleDateString('de-DE')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Karrierepfad */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Karrierepfad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {careerPath && careerPath.length > 0 ? (
            <div className="space-y-4">
              {careerPath.map((path, index) => (
                <div key={path.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {index < careerPath.length - 1 && (
                      <div className="w-0.5 h-full bg-border my-1" style={{ minHeight: '40px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{path.position_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {path.department} • {new Date(path.start_date).toLocaleDateString('de-DE')} 
                          {path.end_date && ` - ${new Date(path.end_date).toLocaleDateString('de-DE')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {canEdit('employee_career') && (
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(path)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Karrierestationen erfasst</p>
              {canCreate('employee_career') && (
                <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Karrierestation hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entwicklungsziele */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Entwicklungsziele
          </CardTitle>
        </CardHeader>
        <CardContent>
          {careerGoals && careerGoals.length > 0 ? (
            <div className="space-y-4">
              {careerGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{goal.goal_title}</h4>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.status === 'completed' ? 'Abgeschlossen' : 
                       goal.status === 'in_progress' ? 'In Arbeit' : 'Geplant'}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Zieldatum: {new Date(goal.target_date).toLocaleDateString('de-DE')}</span>
                    {goal.progress !== null && (
                      <div className="flex-1 max-w-xs">
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Entwicklungsziele definiert</p>
          )}
        </CardContent>
      </Card>

      {/* Kompetenzlücken */}
      {competencyGaps && competencyGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Kompetenzlücken & Empfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competencyGaps.map((gap) => (
                <div key={gap.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{gap.competency_name}</h5>
                    {gap.recommendation && (
                      <p className="text-xs text-muted-foreground mt-1">{gap.recommendation}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Priorität: {gap.priority || 'Mittel'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CareerEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreate : handleEdit}
        entry={selectedEntry}
        mode={dialogMode}
      />
    </div>
  );
};
