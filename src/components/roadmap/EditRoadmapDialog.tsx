import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Target, Settings, Calendar, Plus } from "lucide-react";
import { useRoadmaps, Roadmap } from "@/hooks/useRoadmaps";
import { MilestoneManager } from './MilestoneManager';

interface EditRoadmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmap: Roadmap;
}

export const EditRoadmapDialog = ({ open, onOpenChange, roadmap }: EditRoadmapDialogProps) => {
  const { updateRoadmap } = useRoadmaps();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vision: '',
    mission: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'on_hold' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    start_date: '',
    end_date: '',
    milestones: [] as any[],
    strategic_objectives: [] as any[],
  });

  useEffect(() => {
    if (roadmap) {
      setFormData({
        title: roadmap.title || '',
        description: roadmap.description || '',
        vision: roadmap.vision || '',
        mission: roadmap.mission || '',
        status: roadmap.status || 'draft',
        priority: roadmap.priority || 'medium',
        start_date: roadmap.start_date || '',
        end_date: roadmap.end_date || '',
        milestones: (roadmap as any).milestones || [],
        strategic_objectives: (roadmap as any).strategic_objectives || [],
      });
    }
  }, [roadmap]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return;
    }

    try {
      await updateRoadmap.mutateAsync({
        id: roadmap.id,
        ...formData
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Roadmap:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Roadmap bearbeiten</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Aktualisieren Sie Ihre strategische Planung
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Übersicht
              </TabsTrigger>
              <TabsTrigger value="milestones" className="gap-2">
                <Target className="h-4 w-4" />
                Meilensteine
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Calendar className="h-4 w-4" />
                Ziele
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Einstellungen
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Titel *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="z.B. Produkt Roadmap 2024"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="z.B. Entwicklung neuer Features für das Jahr 2024"
                      rows={3}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vision" className="text-sm font-medium">Vision</Label>
                    <Textarea
                      id="vision"
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      placeholder="z.B. Führende Position im Markt erreichen"
                      rows={2}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mission" className="text-sm font-medium">Mission</Label>
                    <Textarea
                      id="mission"
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      placeholder="z.B. Innovative Lösungen für unsere Kunden entwickeln"
                      rows={2}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'draft' | 'active' | 'completed' | 'on_hold' | 'cancelled') => 
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Entwurf</SelectItem>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                          <SelectItem value="on_hold">Pausiert</SelectItem>
                          <SelectItem value="cancelled">Abgebrochen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium">Priorität</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                          setFormData({ ...formData, priority: value })
                        }
                      >
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-sm font-medium">Startdatum</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-sm font-medium">Enddatum</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4 mt-0">
                <MilestoneManager
                  roadmapId={roadmap.id}
                  milestones={formData.milestones || []}
                  onUpdate={(milestones) => setFormData({ ...formData, milestones })}
                />
              </TabsContent>

              <TabsContent value="goals" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Strategische Ziele</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newObjectives = [...(formData.strategic_objectives || []), { 
                          id: `goal-${Date.now()}`,
                          title: '', 
                          description: '',
                          status: 'planned' 
                        }];
                        setFormData({ ...formData, strategic_objectives: newObjectives });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ziel hinzufügen
                    </Button>
                  </div>
                  
                  {formData.strategic_objectives && formData.strategic_objectives.length > 0 ? (
                    <div className="space-y-3">
                      {formData.strategic_objectives.map((objective: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Input 
                              value={objective.title || ''}
                              onChange={(e) => {
                                const newObjectives = [...(formData.strategic_objectives || [])];
                                newObjectives[index] = { ...objective, title: e.target.value };
                                setFormData({ ...formData, strategic_objectives: newObjectives });
                              }}
                              placeholder="Ziel-Titel"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const newObjectives = formData.strategic_objectives?.filter((_, i) => i !== index) || [];
                                setFormData({ ...formData, strategic_objectives: newObjectives });
                              }}
                            >
                              Entfernen
                            </Button>
                          </div>
                          <Textarea 
                            value={objective.description || ''}
                            onChange={(e) => {
                              const newObjectives = [...(formData.strategic_objectives || [])];
                              newObjectives[index] = { ...objective, description: e.target.value };
                              setFormData({ ...formData, strategic_objectives: newObjectives });
                            }}
                            placeholder="Beschreibung des Ziels"
                            rows={2}
                          />
                          <Select 
                            value={objective.status || 'planned'} 
                            onValueChange={(value) => {
                              const newObjectives = [...(formData.strategic_objectives || [])];
                              newObjectives[index] = { ...objective, status: value };
                              setFormData({ ...formData, strategic_objectives: newObjectives });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Geplant</SelectItem>
                              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                              <SelectItem value="completed">Abgeschlossen</SelectItem>
                              <SelectItem value="on_hold">Pausiert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Keine strategischen Ziele definiert. Fügen Sie Ihr erstes Ziel hinzu.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-0">
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Erweiterte Einstellungen</h3>
                  <p className="text-gray-500 text-sm">
                    Zusätzliche Konfigurationsmöglichkeiten werden bald verfügbar sein.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={updateRoadmap.isPending || !formData.title.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {updateRoadmap.isPending ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};