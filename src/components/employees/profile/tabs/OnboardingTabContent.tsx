import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboardingData } from '@/hooks/employee-tabs/useOnboardingData';
import { CheckSquare, Flag, Laptop, Users } from 'lucide-react';

interface OnboardingTabContentProps {
  employeeId: string;
}

export const OnboardingTabContent: React.FC<OnboardingTabContentProps> = ({ employeeId }) => {
  const { checklists, milestones, equipment, buddy, isLoading, toggleChecklistItem } = useOnboardingData(employeeId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Onboarding-Daten...</div>;
  }

  const completedItems = checklists?.filter(c => c.is_completed).length || 0;
  const totalItems = checklists?.length || 0;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Onboarding Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{completedItems} von {totalItems} Aufgaben erledigt</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Buddy Information */}
      {buddy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Onboarding Buddy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h4 className="font-semibold">
                  {buddy.buddy?.first_name} {buddy.buddy?.last_name}
                </h4>
                <p className="text-sm text-muted-foreground">{buddy.buddy?.position}</p>
                <p className="text-xs text-muted-foreground mt-1">{buddy.buddy?.email}</p>
              </div>
              <Badge variant={buddy.status === 'active' ? 'default' : 'secondary'}>
                {buddy.status === 'active' ? 'Aktiv' : 'Beendet'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkliste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Onboarding Checkliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checklists && checklists.length > 0 ? (
            <div className="space-y-3">
              {checklists.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={(checked) => 
                      toggleChecklistItem.mutate({ id: item.id, isCompleted: !!checked })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <h5 className={`font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.task}
                    </h5>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Checklisten-Punkte vorhanden</p>
          )}
        </CardContent>
      </Card>

      {/* Meilensteine */}
      {milestones && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Meilensteine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{milestone.milestone_title}</h5>
                      <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                        {milestone.status === 'completed' ? 'Erreicht' : 
                         milestone.status === 'in_progress' ? 'In Arbeit' : 'Ausstehend'}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Fällig: {new Date(milestone.due_date).toLocaleDateString('de-DE')}
                      {milestone.responsible && (
                        <> • Verantwortlich: {milestone.responsible.first_name} {milestone.responsible.last_name}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {equipment && equipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              Equipment & Ausstattung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-sm">{item.equipment_type}</span>
                    {item.serial_number && (
                      <span className="text-xs text-muted-foreground ml-2">S/N: {item.serial_number}</span>
                    )}
                  </div>
                  <Badge variant={item.status === 'assigned' ? 'default' : 'secondary'}>
                    {item.status === 'assigned' ? 'Zugewiesen' : 
                     item.status === 'requested' ? 'Angefordert' : 'Ausstehend'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
