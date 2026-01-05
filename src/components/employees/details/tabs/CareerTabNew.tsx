import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Award, Users, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCareerData } from "@/hooks/employee-tabs/useCareerData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EditableField } from "../../shared/EditableField";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";

const priorityLabels: Record<string, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  critical: "Kritisch"
};

const statusLabels: Record<string, string> = {
  not_started: "Nicht begonnen",
  in_progress: "In Arbeit",
  completed: "Abgeschlossen",
  cancelled: "Abgebrochen"
};

const statusColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

interface CareerTabNewProps extends EmployeeTabEditProps {}

export const CareerTabNew = ({ 
  employeeId, 
  isEditing = false,
  onFieldChange,
  pendingChanges 
}: CareerTabNewProps) => {
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTalentDialogOpen, setIsTalentDialogOpen] = useState(false);
  
  const {
    talentPoolStatus,
    careerPath,
    careerGoals,
    competencyGaps,
    isLoading,
    updateTalentPoolStatus,
    addCareerGoal,
    updateCareerGoal,
    deleteCareerGoal
  } = useCareerData(employeeId);

  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmitGoal = async (data: any) => {
    await addCareerGoal.mutateAsync(data);
    reset();
    setIsGoalDialogOpen(false);
  };

  const onSubmitTalent = async (data: any) => {
    await updateTalentPoolStatus.mutateAsync(data);
    setIsTalentDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Lädt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Talentpool Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Talentpool-Status
            </span>
            {!isEditing && (
              <Dialog open={isTalentDialogOpen} onOpenChange={setIsTalentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Talentpool-Status bearbeiten</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmitTalent)} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>High Potential</Label>
                      <Switch 
                        defaultChecked={talentPoolStatus?.is_high_potential}
                        onCheckedChange={(checked) => setValue("is_high_potential", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Key Talent</Label>
                      <Switch 
                        defaultChecked={talentPoolStatus?.is_key_talent}
                        onCheckedChange={(checked) => setValue("is_key_talent", checked)}
                      />
                    </div>
                    <div>
                      <Label>Retention Risk</Label>
                      <Select 
                        defaultValue={talentPoolStatus?.retention_risk || "low"}
                        onValueChange={(value) => setValue("retention_risk", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Niedrig</SelectItem>
                          <SelectItem value="medium">Mittel</SelectItem>
                          <SelectItem value="high">Hoch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Performance Rating</Label>
                      <Select 
                        defaultValue={talentPoolStatus?.performance_rating || "good"}
                        onValueChange={(value) => setValue("performance_rating", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Ausgezeichnet</SelectItem>
                          <SelectItem value="good">Gut</SelectItem>
                          <SelectItem value="satisfactory">Zufriedenstellend</SelectItem>
                          <SelectItem value="needs_improvement">Verbesserungsbedarf</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notizen</Label>
                      <Textarea 
                        defaultValue={talentPoolStatus?.notes || ""}
                        {...register("notes")}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsTalentDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit">Speichern</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="High Potential"
              value={pendingChanges?.career?.is_high_potential ?? talentPoolStatus?.is_high_potential ? "Ja" : "Nein"}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('career', 'is_high_potential', val === 'Ja')}
              type="select"
              options={[{ value: 'Ja', label: 'Ja' }, { value: 'Nein', label: 'Nein' }]}
              valueClassName="font-medium"
            />
            <EditableField
              label="Key Talent"
              value={pendingChanges?.career?.is_key_talent ?? talentPoolStatus?.is_key_talent ? "Ja" : "Nein"}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('career', 'is_key_talent', val === 'Ja')}
              type="select"
              options={[{ value: 'Ja', label: 'Ja' }, { value: 'Nein', label: 'Nein' }]}
              valueClassName="font-medium"
            />
            <EditableField
              label="Retention Risk"
              value={pendingChanges?.career?.retention_risk ?? talentPoolStatus?.retention_risk ?? "Nicht bewertet"}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('career', 'retention_risk', val)}
              type="select"
              options={[
                { value: 'low', label: 'Niedrig' },
                { value: 'medium', label: 'Mittel' },
                { value: 'high', label: 'Hoch' }
              ]}
              valueClassName="font-medium"
            />
            <EditableField
              label="Performance Rating"
              value={pendingChanges?.career?.performance_rating ?? talentPoolStatus?.performance_rating ?? "Nicht bewertet"}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('career', 'performance_rating', val)}
              type="select"
              options={[
                { value: 'excellent', label: 'Ausgezeichnet' },
                { value: 'good', label: 'Gut' },
                { value: 'satisfactory', label: 'Zufriedenstellend' },
                { value: 'needs_improvement', label: 'Verbesserungsbedarf' }
              ]}
              valueClassName="font-medium"
            />
          </div>
          <div className="mt-4">
            <EditableField
              label="Notizen"
              value={pendingChanges?.career?.notes ?? talentPoolStatus?.notes ?? ""}
              isEditing={isEditing}
              onChange={(val) => onFieldChange?.('career', 'notes', val)}
              type="textarea"
              placeholder="Notizen hinzufügen..."
              valueClassName="text-sm text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entwicklungsziele */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Entwicklungsziele
            </span>
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Ziel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Entwicklungsziel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitGoal)} className="space-y-4">
                  <div>
                    <Label>Titel</Label>
                    <Input {...register("title", { required: true })} />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea {...register("description")} rows={3} />
                  </div>
                  <div>
                    <Label>Kategorie</Label>
                    <Select onValueChange={(value) => setValue("category", value)} defaultValue="skill_development">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skill_development">Skill-Entwicklung</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="technical">Technisch</SelectItem>
                        <SelectItem value="certification">Zertifizierung</SelectItem>
                        <SelectItem value="project">Projekt</SelectItem>
                        <SelectItem value="other">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priorität</Label>
                    <Select onValueChange={(value) => setValue("priority", value)} defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niedrig</SelectItem>
                        <SelectItem value="medium">Mittel</SelectItem>
                        <SelectItem value="high">Hoch</SelectItem>
                        <SelectItem value="critical">Kritisch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fälligkeitsdatum</Label>
                    <Input type="date" {...register("due_date")} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit">Erstellen</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {careerGoals && careerGoals.length > 0 ? (
              careerGoals.map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{goal.title}</h4>
                        <Badge className={statusColors[goal.status]}>
                          {statusLabels[goal.status]}
                        </Badge>
                        <Badge variant="outline">{priorityLabels[goal.priority]}</Badge>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fortschritt</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                  {goal.due_date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Fällig: {new Date(goal.due_date).toLocaleDateString("de-DE")}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Entwicklungsziele vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kompetenzlücken */}
      {competencyGaps && competencyGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Kompetenzlücken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competencyGaps.map((gap) => (
                <div key={gap.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{gap.competency_name}</span>
                    <Badge variant="outline">{gap.priority}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Aktuelles Level</p>
                      <Progress value={gap.current_level} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ziel-Level</p>
                      <Progress value={gap.target_level} className="mt-1" />
                    </div>
                  </div>
                  {gap.development_plan && (
                    <p className="text-sm text-muted-foreground">{gap.development_plan}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Karrierepfad */}
      {careerPath && careerPath.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Karrierepfad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {careerPath.map((position) => (
                <div key={position.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{position.position_title}</h4>
                      {position.is_current && (
                        <Badge variant="default">Aktuell</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {position.department} • {new Date(position.start_date).toLocaleDateString("de-DE")}
                      {position.end_date && ` - ${new Date(position.end_date).toLocaleDateString("de-DE")}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
