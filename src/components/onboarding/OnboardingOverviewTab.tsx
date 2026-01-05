import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Sparkles, 
  Users, 
  AlertTriangle, 
  Monitor, 
  CheckCircle,
  Clipboard,
  Download,
  MoreHorizontal,
  Calendar,
  FileText,
  GraduationCap,
  MessageSquare,
  Loader2
} from "lucide-react";
import { OnboardingEmployeeDetailDialog } from "./OnboardingEmployeeDetailDialog";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingProcess } from "@/hooks/useOnboardingProcess";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type OnboardingEmployee = {
  id: string;
  name: string;
  position: string;
  department: string;
  location: string;
  startDate: string;
  status: "running" | "delayed" | "preparing" | "completed";
  progress: number;
  hr: string;
  buddy: string;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "running":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Läuft</Badge>;
    case "delayed":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Verzögert</Badge>;
    case "preparing":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Vorbereitend</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Abgeschlossen</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Mitarbeiter-Willkommensansicht
const EmployeeWelcomeView = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Mitarbeiter';
  
  const email = user?.email ?? null;

  const { data: employee } = useQuery({
    queryKey: ["my-employee-by-email", email],
    enabled: !!email,
    queryFn: async () => {
      if (!email) return null;
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const employeeId = employee?.id ?? null;

  const { data: process } = useQuery({
    queryKey: ["my-onboarding-process", employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      if (!employeeId) return null;
      const { data, error } = await supabase
        .from("onboarding_processes")
        .select("id")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const processId = process?.id ?? null;

  const { data: checklistItems } = useQuery({
    queryKey: ["my-onboarding-checklist-items", processId],
    enabled: !!processId,
    queryFn: async () => {
      if (!processId) return [];
      const { data, error } = await supabase
        .from("onboarding_checklist_items")
        .select("id, title, category, type, status")
        .eq("process_id", processId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "completed":
        return "Erledigt";
      case "in_progress":
        return "In Arbeit";
      default:
        return "Offen";
    }
  };

  const completedItems = checklistItems?.filter((i: any) => i.status === "completed").length ?? 0;
  const totalItems = checklistItems?.length ?? 0;
  const overall = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const contractItem = checklistItems?.find(
    (i: any) => /vertrag/i.test(i.title || "") || i.category === "documents" || i.category === "admin"
  );
  const itAccessItem = checklistItems?.find(
    (i: any) => i.category === "it" || /\bit\b/i.test(i.title || "")
  );
  const trainingItems = checklistItems?.filter((i: any) => i.category === "training" || i.type === "training") ?? [];
  const trainingCompleted = trainingItems.filter((i: any) => i.status === "completed").length;
  const feedbackItem = checklistItems?.find((i: any) => i.type === "feedback" || /feedback/i.test(i.title || ""));

  const personalProgress = {
    overall,
    contract: {
      label: contractItem ? getStatusLabel(contractItem.status) : "Noch keine Daten",
    },
    itAccess: {
      label: itAccessItem ? getStatusLabel(itAccessItem.status) : "Noch keine Daten",
    },
    trainings: {
      label:
        trainingItems.length > 0
          ? `${trainingCompleted} von ${trainingItems.length} abgeschlossen`
          : "Noch keine Daten",
    },
    feedback: {
      label: feedbackItem ? getStatusLabel(feedbackItem.status) : "Noch keine Daten",
    },
  };

  return (
    <div className="space-y-6">
      {/* Willkommens-Card */}
      <Card className="bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-100 rounded-full">
              <Users className="h-8 w-8 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-violet-900">Willkommen, {firstName}!</h2>
              <p className="text-violet-700 mt-1">
                Schön, dass du da bist. Hier findest du alle Informationen zu deinem Onboarding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gesamtfortschritt */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Dein Onboarding-Fortschritt</h3>
            <span className="text-2xl font-bold text-primary">{personalProgress.overall}%</span>
          </div>
          <Progress value={personalProgress.overall} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Du bist auf einem guten Weg! Erledige deine offenen Aufgaben, um dein Onboarding abzuschließen.
          </p>
        </CardContent>
      </Card>

      {/* Status-Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Vertrag</p>
                <p className="text-xs text-green-600">{personalProgress.contract.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Monitor className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">IT-Zugang</p>
                <p className="text-xs text-yellow-600">{personalProgress.itAccess.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Schulungen</p>
                <p className="text-xs text-blue-600">{personalProgress.trainings.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Feedback</p>
                <p className="text-xs text-gray-600">{personalProgress.feedback.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team-Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dein Onboarding-Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
                HR
              </div>
              <div>
                <p className="font-medium">HR Betreuer:in</p>
                <p className="text-sm text-muted-foreground">Noch nicht zugewiesen</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-lg font-medium text-violet-600">
                OB
              </div>
              <div>
                <p className="font-medium">Onboarding Buddy</p>
                <p className="text-sm text-muted-foreground">Noch nicht zugewiesen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin/HR Ansicht
const AdminOverviewView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Echte Daten aus der Datenbank laden
  const { onboardingProcesses, loadingProcesses } = useOnboardingProcess();

  // Daten für die Anzeige transformieren
  const onboardings: OnboardingEmployee[] = useMemo(() => {
    return onboardingProcesses.map(process => {
      const employee = process.employee as any;
      const employeeName = employee?.first_name && employee?.last_name
        ? `${employee.first_name} ${employee.last_name}`
        : employee?.name || 'Unbekannt';
      
      // Status-Mapping von DB zu UI
      let uiStatus: OnboardingEmployee['status'] = 'preparing';
      if (process.status === 'completed') uiStatus = 'completed';
      else if (process.status === 'in_progress') uiStatus = 'running';
      else if (process.status === 'preboarding') uiStatus = 'preparing';
      else if (process.status === 'not_started') uiStatus = 'preparing';

      // Fortschritt basierend auf gamification_score berechnen (0-100)
      const progressValue = process.gamification_score 
        ? Math.min(100, Math.round(process.gamification_score / 10)) 
        : 0;
      
      return {
        id: process.id,
        name: employeeName,
        position: employee?.position || 'Keine Position',
        department: employee?.department || 'Keine Abteilung',
        location: 'Hauptstandort',
        startDate: process.start_date ? format(new Date(process.start_date), 'dd.MM.yyyy', { locale: de }) : '-',
        status: uiStatus,
        progress: progressValue,
        hr: 'HR-Team',
        buddy: 'Noch nicht zugewiesen'
      };
    });
  }, [onboardingProcesses]);

  // Gefilterte Onboardings
  const filteredOnboardings = useMemo(() => {
    return onboardings.filter(o => {
      const matchesSearch = searchQuery === '' || 
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || 
        o.department.toLowerCase().includes(departmentFilter.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [onboardings, searchQuery, statusFilter, departmentFilter]);

  const handleOpenDetails = (employee: OnboardingEmployee) => {
    setSelectedEmployee(employee);
    setDetailDialogOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredOnboardings.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredOnboardings.map(o => o.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  if (loadingProcesses) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade Onboarding-Daten...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KI-Zusammenfassung */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <span className="font-semibold text-violet-900">KI-Zusammenfassung: </span>
            <span className="text-violet-800">
              {onboardings.length > 0 
                ? `Von ${onboardings.length} aktiven Onboardings sind ${onboardings.filter(o => o.status === 'running').length} im Zeitplan.`
                : 'Keine Onboarding-Daten vorhanden. Fügen Sie neue Mitarbeiter hinzu, um Onboardings zu starten.'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Onboardings</p>
                <p className="text-2xl font-bold">{onboardings.filter(o => o.status === 'running').length}</p>
                <p className="text-xs text-muted-foreground">von {onboardings.length} gesamt</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verspätet</p>
                <p className="text-2xl font-bold">{onboardings.filter(o => o.status === 'delayed').length}</p>
                <p className="text-xs text-muted-foreground">{onboardings.length > 0 ? ((onboardings.filter(o => o.status === 'delayed').length / onboardings.length) * 100).toFixed(1) : 0}% aller Fälle</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vorbereitend</p>
                <p className="text-2xl font-bold">{onboardings.filter(o => o.status === 'preparing').length}</p>
                <p className="text-xs text-muted-foreground">In Vorbereitung</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Monitor className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abgeschlossen</p>
                <p className="text-2xl font-bold">{onboardings.filter(o => o.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">{onboardings.length > 0 ? ((onboardings.filter(o => o.status === 'completed').length / onboardings.length) * 100).toFixed(1) : 0}% Erfolgsrate</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Clipboard className="h-4 w-4 mr-2" />
          Filter speichern
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Alle Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="running">Läuft</SelectItem>
              <SelectItem value="delayed">Verzögert</SelectItem>
              <SelectItem value="preparing">Vorbereitend</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="vertrieb">Vertrieb</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="produkt">Produkt</SelectItem>
              <SelectItem value="design">Design</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="zuerich">Zürich</SelectItem>
              <SelectItem value="berlin">Berlin</SelectItem>
              <SelectItem value="wien">Wien</SelectItem>
              <SelectItem value="muenchen">München</SelectItem>
              <SelectItem value="hamburg">Hamburg</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <span className="text-sm text-muted-foreground">{filteredOnboardings.length} Ergebnisse</span>
          <span className="text-sm text-muted-foreground">Einträge pro Seite: 25</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedItems.length === filteredOnboardings.length && filteredOnboardings.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Position & Abteilung</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fortschritt</TableHead>
              <TableHead>Verantwortlich</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOnboardings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Keine Onboarding-Prozesse gefunden.
                </TableCell>
              </TableRow>
            ) : filteredOnboardings.map((onboarding) => (
              <TableRow key={onboarding.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.includes(onboarding.id)}
                    onCheckedChange={() => toggleSelectItem(onboarding.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{onboarding.name}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{onboarding.position}</p>
                    <p className="text-xs text-muted-foreground">{onboarding.department}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{onboarding.location}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{onboarding.startDate}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(onboarding.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={onboarding.progress} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground w-[40px]">{onboarding.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">HR: {onboarding.hr}</p>
                    <p className="text-xs text-muted-foreground">Buddy: {onboarding.buddy}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDetails(onboarding)}>
                        Details anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>E-Mail senden</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Employee Detail Dialog */}
      <OnboardingEmployeeDetailDialog
        employee={selectedEmployee}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};

const OnboardingOverviewTab = () => {
  const { isEmployee } = useEnterprisePermissions();

  // Mitarbeiter sehen ihre personalisierte Willkommensansicht
  if (isEmployee) {
    return <EmployeeWelcomeView />;
  }

  // Admin/HR sehen die volle Übersicht
  return <AdminOverviewView />;
};

export default OnboardingOverviewTab;