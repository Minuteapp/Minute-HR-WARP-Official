import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Users, 
  Bot, 
  Target, 
  FolderKanban, 
  Calendar,
  Brain,
  CheckCircle,
  UserPlus,
  X,
  Search,
  Building2,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  team: string;
}

interface EnhancedNewChannelDialogProps {
  onCreateChannel: (channelData: ChannelCreationData) => Promise<void>;
}

interface ChannelCreationData {
  name: string;
  type: string;
  isPublic: boolean;
  description?: string;
  participants: string[];
  teams: string[];
  aiEnabled: boolean;
  autoCreateProjects: boolean;
  autoCreateTasks: boolean;
  autoDelegateTasks: boolean;
  projectTemplate?: string;
  urgency: string;
}

const CHAT_TYPES = [
  { value: 'public', label: 'Öffentlicher Chat', description: 'Jeder kann beitreten und sehen' },
  { value: 'private', label: 'Privater Chat', description: 'Nur eingeladene Mitglieder' },
  { value: 'direct', label: 'Direktnachricht', description: '1:1 Unterhaltung' },
  { value: 'department', label: 'Abteilungs-Chat', description: 'Für eine ganze Abteilung' },
  { value: 'project', label: 'Projekt-Chat', description: 'Projektbezogene Kommunikation' },
  { value: 'team', label: 'Team-Chat', description: 'Für spezifische Teams' }
];

const PROJECT_TEMPLATES = [
  { value: 'marketing', label: 'Marketing-Kampagne' },
  { value: 'development', label: 'Software-Entwicklung' },
  { value: 'research', label: 'Forschung & Analyse' },
  { value: 'event', label: 'Event-Planung' },
  { value: 'training', label: 'Schulung & Weiterbildung' },
  { value: 'custom', label: 'Benutzerdefiniert' }
];

export const EnhancedNewChannelDialog: React.FC<EnhancedNewChannelDialogProps> = ({ onCreateChannel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Channel Info
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('public');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Participants & Teams
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI & Automation
  const [aiEnabled, setAiEnabled] = useState(false);
  const [autoCreateProjects, setAutoCreateProjects] = useState(false);
  const [autoCreateTasks, setAutoCreateTasks] = useState(false);
  const [autoDelegateTasks, setAutoDelegateTasks] = useState(false);
  const [projectTemplate, setProjectTemplate] = useState<string>('');
  const [urgency, setUrgency] = useState('medium');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      loadTeams();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, position, department, team')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      toast.error('Fehler beim Laden der Mitarbeiter');
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('team')
        .not('team', 'is', null)
        .neq('team', '');
      
      if (error) throw error;
      const uniqueTeams = [...new Set(data?.map(item => item.team).filter(Boolean))];
      setTeams(uniqueTeams);
    } catch (error) {
      console.error('Fehler beim Laden der Teams:', error);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.team?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleParticipantToggle = (employeeId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleTeamToggle = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team) 
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  const removeParticipant = (employeeId: string) => {
    setSelectedParticipants(prev => prev.filter(id => id !== employeeId));
  };

  const removeTeam = (team: string) => {
    setSelectedTeams(prev => prev.filter(t => t !== team));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mindestvalidierung
    if (!channelName.trim()) {
      toast.error('Bitte geben Sie einen Namen für den Chat ein');
      return;
    }
    
    setIsLoading(true);
    try {
      const channelData: ChannelCreationData = {
        name: channelName,
        type: channelType,
        isPublic,
        description: channelDescription,
        participants: selectedParticipants,
        teams: selectedTeams,
        aiEnabled,
        autoCreateProjects,
        autoCreateTasks,
        autoDelegateTasks,
        projectTemplate,
        urgency
      };

      await onCreateChannel(channelData);
      
      // Reset form
      setIsOpen(false);
      resetForm();
      
      toast.success('Chat erfolgreich erstellt!');
    } catch (error) {
      console.error('Fehler beim Erstellen des Channels:', error);
      toast.error('Fehler beim Erstellen des Chats');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setChannelName('');
    setChannelType('public');
    setChannelDescription('');
    setIsPublic(true);
    setSelectedParticipants([]);
    setSelectedTeams([]);
    setAiEnabled(false);
    setAutoCreateProjects(false);
    setAutoCreateTasks(false);
    setAutoDelegateTasks(false);
    setProjectTemplate('');
    setUrgency('medium');
    setActiveTab('basic');
    setSearchTerm('');
  };

  const getSelectedEmployeesNames = () => {
    return employees
      .filter(emp => selectedParticipants.includes(emp.id))
      .map(emp => emp.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-dashed hover:border-primary/50 mb-4"
        >
          <Plus className="h-5 w-5" />
          <span>Neuen Chat erstellen</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Erweiterten Chat erstellen
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basis-Info</TabsTrigger>
            <TabsTrigger value="participants">Teilnehmer</TabsTrigger>
            <TabsTrigger value="automation">KI & Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat-Grundlagen</CardTitle>
                  <CardDescription>
                    Definieren Sie die Basis-Eigenschaften Ihres Chats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="channelName">Name des Chats *</Label>
                    <Input
                      id="channelName"
                      placeholder="z.B. Marketing Team, Projekt Alpha..."
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channelType">Chat-Typ</Label>
                    <Select value={channelType} onValueChange={setChannelType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHAT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channelDescription">Beschreibung</Label>
                    <Textarea
                      id="channelDescription"
                      placeholder="Beschreiben Sie den Zweck dieses Chats..."
                      value={channelDescription}
                      onChange={(e) => setChannelDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="isPublic" className="text-sm font-medium">
                      Öffentlich sichtbar
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Teilnehmer & Teams</CardTitle>
                  <CardDescription>
                    Wählen Sie Mitarbeiter und Teams für diesen Chat aus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Mitarbeiter suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Selected Items Display */}
                  {(selectedParticipants.length > 0 || selectedTeams.length > 0) && (
                    <div className="space-y-2">
                      <Label>Ausgewählt:</Label>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedEmployeesNames().map(name => (
                          <Badge key={name} variant="secondary" className="flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            {name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => {
                                const emp = employees.find(e => e.name === name);
                                if (emp) removeParticipant(emp.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {selectedTeams.map(team => (
                          <Badge key={team} variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {team}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeTeam(team)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Teams Selection */}
                  <div className="space-y-2">
                    <Label>Teams auswählen</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {teams.map(team => (
                        <div key={team} className="flex items-center space-x-2">
                          <Checkbox
                            id={`team-${team}`}
                            checked={selectedTeams.includes(team)}
                            onCheckedChange={() => handleTeamToggle(team)}
                          />
                          <Label htmlFor={`team-${team}`} className="text-sm">
                            {team}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Individual Employees */}
                  <div className="space-y-2">
                    <Label>Einzelne Mitarbeiter</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredEmployees.map(employee => (
                        <div key={employee.id} className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50">
                          <Checkbox
                            id={`emp-${employee.id}`}
                            checked={selectedParticipants.includes(employee.id)}
                            onCheckedChange={() => handleParticipantToggle(employee.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {employee.position} • {employee.team || 'Kein Team'} • {employee.department || 'Keine Abteilung'}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    KI-Assistent & Automation
                  </CardTitle>
                  <CardDescription>
                    Aktivieren Sie intelligente Features für automatische Projektarbeit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Assistant */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="aiEnabled"
                        checked={aiEnabled}
                        onCheckedChange={setAiEnabled}
                      />
                      <Label htmlFor="aiEnabled" className="font-medium">
                        KI-Assistent aktivieren
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Der KI-Assistent kann Gespräche moderieren, Aufgaben erkennen und automatisch Vorschläge machen.
                    </p>
                  </div>

                  <Separator />

                  {/* Automation Features */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Automatisierungs-Features</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Switch
                          id="autoCreateProjects"
                          checked={autoCreateProjects}
                          onCheckedChange={setAutoCreateProjects}
                          disabled={!aiEnabled}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="autoCreateProjects" className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4" />
                            Automatische Projekterstellung
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            KI erkennt Projektdiskussionen und erstellt automatisch Projekte mit Meilensteinen
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Switch
                          id="autoCreateTasks"
                          checked={autoCreateTasks}
                          onCheckedChange={setAutoCreateTasks}
                          disabled={!aiEnabled}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="autoCreateTasks" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Automatische Aufgabenerstellung
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            KI erkennt To-Dos in Nachrichten und erstellt automatisch Aufgaben
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Switch
                          id="autoDelegateTasks"
                          checked={autoDelegateTasks}
                          onCheckedChange={setAutoDelegateTasks}
                          disabled={!aiEnabled || !autoCreateTasks}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="autoDelegateTasks" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Automatische Aufgaben-Delegierung
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            KI weist Aufgaben automatisch den passenden Teammitgliedern zu
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Template Selection */}
                  {autoCreateProjects && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="projectTemplate">Projekt-Vorlage</Label>
                        <Select value={projectTemplate} onValueChange={setProjectTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Vorlage auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PROJECT_TEMPLATES.map(template => (
                              <SelectItem key={template.value} value={template.value}>
                                {template.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Urgency Setting */}
                  {(autoCreateTasks || autoCreateProjects) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Standard-Priorität</Label>
                        <Select value={urgency} onValueChange={setUrgency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Niedrig</SelectItem>
                            <SelectItem value="medium">Mittel</SelectItem>
                            <SelectItem value="high">Hoch</SelectItem>
                            <SelectItem value="urgent">Dringend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            
            <div className="flex gap-2">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'participants', 'automation'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={isLoading}
                >
                  Zurück
                </Button>
              )}
              
              {activeTab !== 'automation' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'participants', 'automation'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  disabled={!channelName.trim()}
                >
                  Weiter
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!channelName.trim() || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Brain className="h-4 w-4 animate-spin" />
                      Chat wird erstellt...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Chat erstellen
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};