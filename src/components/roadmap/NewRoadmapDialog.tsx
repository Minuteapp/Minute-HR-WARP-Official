import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Target, Settings, Calendar, Plus, Trash2, ChevronLeft, ChevronRight, Flag, Users } from "lucide-react";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { supabase } from "@/integrations/supabase/client";

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
}

interface GoalData {
  id: string;
  title: string;
  description: string;
  target_date: string;
  success_criteria: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SettingsData {
  visibility: 'public' | 'private' | 'team';
  notifications_enabled: boolean;
  color_scheme: string;
  tags: string;
  default_view: 'timeline' | 'kanban' | 'list';
}

interface NewRoadmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS = ['overview', 'milestones', 'goals', 'settings'] as const;
type TabType = typeof TABS[number];

export const NewRoadmapDialog = ({ open, onOpenChange }: NewRoadmapDialogProps) => {
  const { createRoadmap } = useRoadmaps();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vision: '',
    mission: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'on_hold' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    start_date: '',
    end_date: '',
    team_id: '' as string,
    visibility: 'team' as 'private' | 'team' | 'department' | 'company'
  });

  // Lade Teams für Dropdown
  const { data: teams } = useQuery({
    queryKey: ['teams-for-roadmap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [settings, setSettings] = useState<SettingsData>({
    visibility: 'team',
    notifications_enabled: true,
    color_scheme: '#3b82f6',
    tags: '',
    default_view: 'timeline'
  });

  const currentTabIndex = TABS.indexOf(activeTab);

  const goNext = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1]);
    }
  };

  const goPrevious = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1]);
    }
  };

  const addMilestone = () => {
    const newMilestone: MilestoneData = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      status: 'pending'
    };
    setMilestones([...milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: keyof MilestoneData, value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const addGoal = () => {
    const newGoal: GoalData = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      target_date: '',
      success_criteria: '',
      priority: 'medium'
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, field: keyof GoalData, value: string) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return;
    }

    try {
      // Roadmap erstellen (Meilensteine und Ziele werden vorerst im State gehalten)
      await createRoadmap.mutateAsync({
        ...formData
      });
      
      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        vision: '',
        mission: '',
        status: 'draft',
        priority: 'medium',
        start_date: '',
        end_date: '',
        team_id: '',
        visibility: 'team'
      });
      setMilestones([]);
      setGoals([]);
      setSettings({
        visibility: 'team',
        notifications_enabled: true,
        color_scheme: '#3b82f6',
        tags: '',
        default_view: 'timeline'
      });
      setActiveTab('overview');
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen der Roadmap:', error);
    }
  };

  const isLastTab = currentTabIndex === TABS.length - 1;
  const isFirstTab = currentTabIndex === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Neue Roadmap erstellen</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Definieren Sie Ihre strategische Planung und Meilensteine
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="h-full flex flex-col">
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
                <Flag className="h-4 w-4" />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team" className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team zuordnen
                      </Label>
                      <Select
                        value={formData.team_id || 'none'}
                        onValueChange={(value) => 
                          setFormData({ ...formData, team_id: value === 'none' ? '' : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kein Team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kein Team</SelectItem>
                          {teams?.map(team => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visibility" className="text-sm font-medium">Sichtbarkeit</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value: 'private' | 'team' | 'department' | 'company') => 
                          setFormData({ ...formData, visibility: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Privat (nur ich)</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="department">Abteilung</SelectItem>
                          <SelectItem value="company">Unternehmen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4 mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Meilensteine</h3>
                    <p className="text-sm text-muted-foreground">Definieren Sie wichtige Etappen Ihrer Roadmap</p>
                  </div>
                  <Button onClick={addMilestone} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Meilenstein hinzufügen
                  </Button>
                </div>

                {milestones.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Noch keine Meilensteine hinzugefügt</p>
                    <Button onClick={addMilestone} variant="outline" size="sm" className="mt-3 gap-2">
                      <Plus className="h-4 w-4" />
                      Ersten Meilenstein erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <Card key={milestone.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                                <Input
                                  value={milestone.title}
                                  onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                  placeholder="Meilenstein-Titel"
                                  className="flex-1"
                                />
                              </div>
                              <Textarea
                                value={milestone.description}
                                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                placeholder="Beschreibung des Meilensteins..."
                                rows={2}
                              />
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Zieldatum</Label>
                                  <Input
                                    type="date"
                                    value={milestone.due_date}
                                    onChange={(e) => updateMilestone(milestone.id, 'due_date', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Priorität</Label>
                                  <Select
                                    value={milestone.priority}
                                    onValueChange={(v) => updateMilestone(milestone.id, 'priority', v)}
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
                                <div>
                                  <Label className="text-xs">Status</Label>
                                  <Select
                                    value={milestone.status}
                                    onValueChange={(v) => updateMilestone(milestone.id, 'status', v)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Ausstehend</SelectItem>
                                      <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMilestone(milestone.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="goals" className="space-y-4 mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Strategische Ziele</h3>
                    <p className="text-sm text-muted-foreground">Definieren Sie messbare Ziele für Ihre Roadmap</p>
                  </div>
                  <Button onClick={addGoal} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ziel hinzufügen
                  </Button>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Flag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Noch keine Ziele hinzugefügt</p>
                    <Button onClick={addGoal} variant="outline" size="sm" className="mt-3 gap-2">
                      <Plus className="h-4 w-4" />
                      Erstes Ziel erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <Card key={goal.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                                <Input
                                  value={goal.title}
                                  onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
                                  placeholder="Ziel-Titel"
                                  className="flex-1"
                                />
                              </div>
                              <Textarea
                                value={goal.description}
                                onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                                placeholder="Beschreibung des Ziels..."
                                rows={2}
                              />
                              <Textarea
                                value={goal.success_criteria}
                                onChange={(e) => updateGoal(goal.id, 'success_criteria', e.target.value)}
                                placeholder="Erfolgskriterien (z.B. KPIs, messbare Ergebnisse)..."
                                rows={2}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Zieldatum</Label>
                                  <Input
                                    type="date"
                                    value={goal.target_date}
                                    onChange={(e) => updateGoal(goal.id, 'target_date', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Priorität</Label>
                                  <Select
                                    value={goal.priority}
                                    onValueChange={(v) => updateGoal(goal.id, 'priority', v)}
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
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeGoal(goal.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-0">
                <div className="mb-4">
                  <h3 className="font-medium">Erweiterte Einstellungen</h3>
                  <p className="text-sm text-muted-foreground">Konfigurieren Sie Ihre Roadmap-Optionen</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sichtbarkeit</Label>
                    <Select
                      value={settings.visibility}
                      onValueChange={(v: 'public' | 'private' | 'team') => 
                        setSettings({ ...settings, visibility: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privat (nur Sie)</SelectItem>
                        <SelectItem value="team">Team (Ihr Team)</SelectItem>
                        <SelectItem value="public">Öffentlich (Alle im Unternehmen)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Benachrichtigungen</Label>
                      <p className="text-xs text-muted-foreground">E-Mail-Benachrichtigungen bei Updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications_enabled}
                      onCheckedChange={(v) => setSettings({ ...settings, notifications_enabled: v })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Farbschema</Label>
                    <div className="flex gap-2">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSettings({ ...settings, color_scheme: color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            settings.color_scheme === color ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags / Labels</Label>
                    <Input
                      value={settings.tags}
                      onChange={(e) => setSettings({ ...settings, tags: e.target.value })}
                      placeholder="z.B. Q1-2024, Marketing, Produkt (kommagetrennt)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Standard-Ansicht</Label>
                    <Select
                      value={settings.default_view}
                      onValueChange={(v: 'timeline' | 'kanban' | 'list') => 
                        setSettings({ ...settings, default_view: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timeline">Timeline</SelectItem>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="list">Liste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-4 flex justify-between">
          <div>
            {!isFirstTab && (
              <Button variant="outline" type="button" onClick={goPrevious} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            {isLastTab ? (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={createRoadmap.isPending || !formData.title.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {createRoadmap.isPending ? 'Wird erstellt...' : 'Roadmap erstellen'}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} className="gap-2">
                Weiter
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
