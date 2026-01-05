import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, DollarSign, Users, Settings, Plus, Sparkles, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/avatarUtils";
import { createProject } from "@/hooks/projects/services/projectCreationService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthProvider";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export function ProjectDetailsDialog({ open, onOpenChange, template }: ProjectDetailsDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basics");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['personal', 'software', 'hardware', 'external']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [projectType, setProjectType] = useState("internal");
  const [priority, setPriority] = useState("medium");
  const [risk, setRisk] = useState("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [costCenter, setCostCenter] = useState("");
  const [projectLead, setProjectLead] = useState("");
  const [confidentiality, setConfidentiality] = useState("intern");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [co2Tracking, setCo2Tracking] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(true);
  const [complianceMonitoring, setComplianceMonitoring] = useState(false);

  const tabs = [
    { id: "basics", label: "Grunddaten", icon: FileText },
    { id: "timeline", label: "Zeitplan", icon: Calendar },
    { id: "budget", label: "Budget", icon: DollarSign },
    { id: "team", label: "Team", icon: Users },
    { id: "settings", label: "Einstellungen", icon: Settings },
  ];

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Bitte geben Sie einen Projektnamen ein");
      setActiveTab("basics");
      return;
    }

    if (!startDate) {
      toast.error("Bitte geben Sie ein Startdatum ein");
      setActiveTab("timeline");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        name: projectName.trim(),
        description: description.trim(),
        startDate: startDate,
        dueDate: endDate || undefined,
        priority: priority as 'high' | 'medium' | 'low',
        status: 'pending' as const,
        budget: budget ? parseFloat(budget) : undefined,
        currency: currency,
        costCenter: costCenter.trim() || undefined,
        responsiblePerson: projectLead || undefined,
        project_type: projectType,
        team: selectedMembers.map(id => ({ id })),
      };

      console.log('Creating project with data:', formData);
      await createProject(formData, user);
      
      toast.success("Projekt erfolgreich erstellt!");
      onOpenChange(false);
      
      // Reset form
      setProjectName("");
      setDescription("");
      setDepartment("");
      setProjectType("internal");
      setPriority("medium");
      setRisk("medium");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setCurrency("EUR");
      setCostCenter("");
      setProjectLead("");
      setSelectedMembers([]);
      setActiveTab("basics");
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchTemplate = () => {
    // TODO: Go back to template selection
    onOpenChange(false);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Team members werden jetzt aus der Datenbank geladen (hier: leeres Array als Fallback)
  const teamMembers: { id: string; name: string; role: string; avatar_color: string }[] = [];
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <DialogTitle>Projektdetails konfigurieren</DialogTitle>
            </div>
            <Button variant="link" size="sm" onClick={handleSwitchTemplate}>
              Vorlage wechseln
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Füllen Sie die Details für Ihr neues Projekt aus
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="basics" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="projectName">
                Projektname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projectName"
                placeholder="z.B. ERP Migration 2025"
                className="mt-1.5"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung des Projekts und der Ziele..."
                className="mt-1.5 min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Abteilung</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department" className="mt-1.5">
                    <SelectValue placeholder="Abteilung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="projectType">Projekttyp</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger id="projectType" className="mt-1.5">
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Intern</SelectItem>
                    <SelectItem value="external">Extern</SelectItem>
                    <SelectItem value="mixed">Gemischt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priorität</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="mt-1.5">
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
                <Label htmlFor="risk">Anfängliches Risiko-Level</Label>
                <Select value={risk} onValueChange={setRisk}>
                  <SelectTrigger id="risk" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">
                  Startdatum <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="mt-1.5"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Enddatum</Label>
                <Input
                  id="endDate"
                  type="date"
                  className="mt-1.5"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Meilensteine (optional)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setMilestones([...milestones, ""])}
                >
                  <Plus className="w-4 h-4" />
                  Meilenstein hinzufügen
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Meilensteine können nach der Projekterstellung hinzugefügt werden
              </p>
              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((_, index) => (
                    <Input
                      key={index}
                      placeholder={`Meilenstein ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalBudget">Gesamtbudget</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="totalBudget"
                    type="number"
                    placeholder="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="costCenter">Kostenstelle</Label>
                <Input
                  id="costCenter"
                  placeholder="z.B. KST-1234"
                  className="mt-1.5"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Budget-Kategorien</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Personal, Lizenzen, Hardware etc. können nach der Projekterstellung konfiguriert werden
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'personal', label: 'Personal' },
                  { id: 'software', label: 'Software/Lizenzen' },
                  { id: 'hardware', label: 'Hardware' },
                  { id: 'external', label: 'Externe Dienstleister' }
                ].map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category.id)}
                    type="button"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="projectLead">Projektleiter</Label>
              <Select value={projectLead} onValueChange={setProjectLead}>
                <SelectTrigger id="projectLead" className="mt-1.5">
                  <SelectValue placeholder="Projektleiter wählen" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.length === 0 ? (
                    <SelectItem value="none" disabled>Keine Teammitglieder verfügbar</SelectItem>
                  ) : teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${member.avatar_color} text-white text-xs flex items-center justify-center font-semibold`}>
                          {getInitials(member.name)}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Team-Mitglieder</Label>
                <span className="text-sm text-muted-foreground">
                  {selectedMembers.length} ausgewählt
                </span>
              </div>

              {/* Suchfeld */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Team-Mitglied suchen..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mitglieder-Liste mit ScrollArea */}
              <ScrollArea className="h-64 border rounded-lg p-2">
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => toggleMember(member.id)}
                    >
                      <div className={`w-10 h-10 rounded-full ${member.avatar_color} flex items-center justify-center font-semibold text-sm text-white`}>
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="confidentiality">Vertraulichkeitsstufe</Label>
              <Select value={confidentiality} onValueChange={setConfidentiality}>
                <SelectTrigger id="confidentiality" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Öffentlich</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="confidential">Vertraulich</SelectItem>
                  <SelectItem value="secret">Geheim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">KI-Assistenz aktivieren</p>
                    <p className="text-xs text-muted-foreground">Smart Planner, Riskoberater & Forecasts</p>
                  </div>
                </div>
                <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600">🌱</span>
                  </div>
                  <div>
                    <p className="font-medium">CO₂-Tracking aktivieren</p>
                    <p className="text-xs text-muted-foreground">Nachhaltigkeitskennzahlen erfassen</p>
                  </div>
                </div>
                <input type="checkbox" checked={co2Tracking} onChange={(e) => setCo2Tracking(e.target.checked)} className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600">⚠️</span>
                  </div>
                  <div>
                    <p className="font-medium">Automatische Risikobewertung</p>
                    <p className="text-xs text-muted-foreground">KI-gestützte Risikoerkennung</p>
                  </div>
                </div>
                <input type="checkbox" checked={riskAssessment} onChange={(e) => setRiskAssessment(e.target.checked)} className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">🛡️</span>
                  </div>
                  <div>
                    <p className="font-medium">Compliance-Monitoring</p>
                    <p className="text-xs text-muted-foreground">Governance & Audit-Trail aktivieren</p>
                  </div>
                </div>
                <input type="checkbox" checked={complianceMonitoring} onChange={(e) => setComplianceMonitoring(e.target.checked)} className="w-5 h-5" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleCreateProject} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Projekt erstellen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
