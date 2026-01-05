import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Calendar, Package, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingData } from "@/hooks/employee-tabs/useOnboardingData";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

const categoryLabels: Record<string, string> = {
  admin: "Administration",
  it: "IT",
  training: "Training",
  team: "Team",
  equipment: "Equipment",
  other: "Sonstige"
};

const equipmentStatusLabels: Record<string, string> = {
  ordered: "Bestellt",
  delivered: "Geliefert",
  assigned: "Zugewiesen",
  returned: "Zurückgegeben"
};

const equipmentStatusColors: Record<string, string> = {
  ordered: "bg-yellow-100 text-yellow-800",
  delivered: "bg-blue-100 text-blue-800",
  assigned: "bg-green-100 text-green-800",
  returned: "bg-gray-100 text-gray-800"
};

export const OnboardingTabNew = ({ employeeId }: { employeeId: string }) => {
  const {
    checklists,
    milestones,
    equipment,
    buddy,
    isLoading,
    toggleChecklistItem,
    updateEquipmentStatus
  } = useOnboardingData(employeeId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Lädt...</p>
        </CardContent>
      </Card>
    );
  }

  const completedItems = checklists?.filter(item => item.is_completed).length || 0;
  const totalItems = checklists?.length || 0;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Onboarding Fortschritt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Onboarding Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Abgeschlossen</span>
              <span className="font-medium">{completedItems} von {totalItems}</span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </CardContent>
      </Card>

      {/* Buddy */}
      {buddy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Onboarding Buddy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div>
                <p className="font-medium">
                  {buddy.buddy?.first_name} {buddy.buddy?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{buddy.buddy?.position}</p>
                <p className="text-sm text-muted-foreground">{buddy.buddy?.email}</p>
              </div>
              <Badge variant="outline">{buddy.status}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkliste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Checkliste
            </span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Punkt hinzufügen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checklists && checklists.length > 0 ? (
              checklists.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={(checked) =>
                      toggleChecklistItem.mutate({ id: item.id, isCompleted: !!checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[item.category]}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    {item.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Fällig: {format(new Date(item.due_date), "dd.MM.yyyy", { locale: de })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Checklisten-Punkte vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meilensteine */}
      {milestones && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meilensteine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Fällig: {format(new Date(milestone.due_date), "dd.MM.yyyy", { locale: de })}
                        </span>
                        {milestone.responsible && (
                          <span>
                            Verantwortlich: {milestone.responsible.first_name} {milestone.responsible.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{milestone.status}</Badge>
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
              <Package className="h-5 w-5" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.equipment_name}</p>
                      <Badge variant="outline">{item.equipment_type}</Badge>
                    </div>
                    {item.serial_number && (
                      <p className="text-sm text-muted-foreground">S/N: {item.serial_number}</p>
                    )}
                  </div>
                  <Badge className={equipmentStatusColors[item.status]}>
                    {equipmentStatusLabels[item.status]}
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
