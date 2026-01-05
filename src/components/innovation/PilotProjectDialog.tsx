import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Rocket, 
  Calendar, 
  User, 
  Edit3,
  Target,
  Users,
  Save,
  X,
  Euro,
  Clock
} from 'lucide-react';
import { PilotProject } from '@/types/innovation';
import { useInnovation } from '@/hooks/useInnovation';
import { toast } from 'sonner';

interface PilotProjectDialogProps {
  project: PilotProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PilotProjectDialog = ({ project, open, onOpenChange }: PilotProjectDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<PilotProject | null>(null);
  const { updatePilotProject } = useInnovation();

  // Initialize edited project when dialog opens
  const handleEditStart = () => {
    if (project) {
      setEditedProject({ ...project });
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    setEditedProject(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedProject) return;

    try {
      await updatePilotProject(editedProject.id, editedProject);
      toast.success('Pilotprojekt erfolgreich aktualisiert');
      setIsEditing(false);
      setEditedProject(null);
    } catch (error) {
      toast.error('Fehler beim Speichern des Pilotprojekts');
    }
  };

  const currentProject = isEditing ? editedProject : project;

  if (!currentProject) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pilot_phase': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'scaling': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                {isEditing ? (
                  <Input
                    value={currentProject.title}
                    onChange={(e) => setEditedProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="text-xl font-bold border-0 p-0 h-auto"
                  />
                ) : (
                  currentProject.title
                )}
              </DialogTitle>
              <div className="mt-2">
                {isEditing ? (
                  <Textarea
                    value={currentProject.description}
                    onChange={(e) => setEditedProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="text-sm text-muted-foreground resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={getStatusColor(currentProject.status)}>
                {getStatusLabel(currentProject.status)}
              </Badge>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditStart}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentProject.progress}%</div>
                <p className="text-xs text-muted-foreground">Fortschritt</p>
                {isEditing && (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={currentProject.progress}
                    onChange={(e) => setEditedProject(prev => prev ? { ...prev, progress: parseInt(e.target.value) || 0 } : null)}
                    className="mt-1 text-center"
                  />
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(currentProject.start_date).toLocaleDateString('de-DE')}
                </div>
                <p className="text-xs text-muted-foreground">Startdatum</p>
                {isEditing && (
                  <Input
                    type="date"
                    value={currentProject.start_date}
                    onChange={(e) => setEditedProject(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                    className="mt-1"
                  />
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium flex items-center justify-center gap-1">
                  <Euro className="h-3 w-3" />
                  {currentProject.budget ? `${currentProject.budget.toLocaleString('de-DE')} €` : 'Nicht definiert'}
                </div>
                <p className="text-xs text-muted-foreground">Budget</p>
                {isEditing && (
                  <Input
                    type="number"
                    min="0"
                    value={currentProject.budget || ''}
                    onChange={(e) => setEditedProject(prev => prev ? { ...prev, budget: parseInt(e.target.value) || 0 } : null)}
                    className="mt-1"
                  />
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium flex items-center justify-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate" title={currentProject.responsible_person}>
                    {currentProject.responsible_person}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Verantwortlich</p>
                {isEditing && (
                  <Input
                    value={currentProject.responsible_person}
                    onChange={(e) => setEditedProject(prev => prev ? { ...prev, responsible_person: e.target.value } : null)}
                    className="mt-1"
                  />
                )}
              </div>
            </div>
            <div className="mt-4">
              <Progress value={currentProject.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <Rocket className="h-3 w-3" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-1 text-xs">
              <Target className="h-3 w-3" />
              Kriterien
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" />
              Team
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projektdetails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Risikobewertung</h4>
                  {isEditing ? (
                    <Textarea
                      value={currentProject.risk_assessment || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, risk_assessment: e.target.value } : null)}
                      placeholder="Beschreiben Sie die Risiken..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">{currentProject.risk_assessment || 'Keine Risikobewertung vorhanden'}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Erkenntnisse</h4>
                  {isEditing ? (
                    <Textarea
                      value={currentProject.learnings || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, learnings: e.target.value } : null)}
                      placeholder="Welche Erkenntnisse wurden gewonnen..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">{currentProject.learnings || 'Noch keine Erkenntnisse dokumentiert'}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Nächste Schritte</h4>
                  {isEditing ? (
                    <Textarea
                      value={currentProject.next_steps || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, next_steps: e.target.value } : null)}
                      placeholder="Was sind die nächsten Schritte..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">{currentProject.next_steps || 'Keine nächsten Schritte definiert'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Erfolgskriterien</CardTitle>
              </CardHeader>
              <CardContent>
                {currentProject.success_metrics && currentProject.success_metrics.length > 0 ? (
                  <ul className="space-y-3">
                    {currentProject.success_metrics.map((metric, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{metric}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Keine Erfolgskriterien definiert.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team-Zusammensetzung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Projektleitung</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">{currentProject.responsible_person}</span>
                  </div>
                </div>
                
                {currentProject.team_members && currentProject.team_members.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Team-Mitglieder ({currentProject.team_members.length})</h4>
                    <div className="space-y-2">
                      {currentProject.team_members.map((member, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projekt-Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border-l-4 border-l-green-500 bg-green-50">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Projektstart</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentProject.start_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  
                  {currentProject.end_date && (
                    <div className="flex items-center gap-4 p-4 border-l-4 border-l-orange-500 bg-orange-50">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Geplantes Ende</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(currentProject.end_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 p-4 border-l-4 border-l-blue-500 bg-blue-50">
                    <Rocket className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Aktueller Status</p>
                      <p className="text-sm text-muted-foreground">
                        {getStatusLabel(currentProject.status)} - {currentProject.progress}% abgeschlossen
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};