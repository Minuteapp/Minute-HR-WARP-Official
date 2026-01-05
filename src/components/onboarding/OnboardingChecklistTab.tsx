import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Users,
  MoreHorizontal,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import NewOnboardingTaskDialog from "./NewOnboardingTaskDialog";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

interface Task {
  id: number;
  name: string;
  responsible: string;
  dueDate: string;
  category: string;
  priority: "Hoch" | "Mittel" | "Niedrig";
  status: "completed" | "overdue" | "pending" | "in_progress";
  completedDate?: string;
  completedBy?: string;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  startDate: string;
  tasksCompleted: number;
  totalTasks: number;
  progress: number;
  tasks: Task[];
}

const mockEmployees: Employee[] = [];

// Mitarbeiter-spezifische Ansicht
const EmployeeChecklistView = () => {
  const myTasks: Task[] = [];

  const kpiCards = [
    { label: "Erledigt", value: "0", icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "In Arbeit", value: "0", icon: Clock, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Überfällig", value: "0", icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
    { label: "Offen", value: "0", icon: FileText, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Hoch":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Hoch</Badge>;
      case "Mittel":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Mittel</Badge>;
      case "Niedrig":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Erledigt</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Überfällig</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Arbeit</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Offen</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header für Mitarbeiter */}
      <div>
        <h2 className="text-xl font-semibold">Meine Onboarding-Checkliste</h2>
        <p className="text-sm text-muted-foreground">Deine persönlichen Aufgaben und Fortschritt</p>
      </div>

      {/* Fortschrittsanzeige */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Dein Fortschritt</span>
            <span className="text-sm font-bold">0 von 0 Aufgaben</span>
          </div>
          <Progress value={0} className="h-2" />
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aufgabenliste */}
      <Card>
        <CardContent className="p-4">
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Keine Aufgaben vorhanden</p>
              <p className="text-sm">Deine Onboarding-Aufgaben werden hier angezeigt.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={task.status === "completed"} />
                    <div>
                      <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Fällig: {task.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Admin/HR Ansicht
const AdminChecklistView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [expandedEmployees, setExpandedEmployees] = useState<number[]>([1]);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

  const { hasAction } = useEnterprisePermissions();
  const canCreateTask = hasAction('onboarding', 'create') || hasAction('onboarding', 'approve');

  const kpiCards = [
    { label: "Gesamt", value: "0", icon: CheckSquare, iconBg: "bg-gray-100", iconColor: "text-gray-600" },
    { label: "Abgeschlossen", value: "0", icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "In Bearbeitung", value: "0", icon: Clock, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Überfällig", value: "0", icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
    { label: "Offen", value: "0", icon: FileText, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  ];

  const toggleEmployee = (employeeId: number) => {
    setExpandedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const resetFilters = () => {
    setFilterEmployee("all");
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterPriority("all");
    setFilterResponsible("all");
    setSearchQuery("");
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Hoch":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Hoch</Badge>;
      case "Mittel":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Mittel</Badge>;
      case "Niedrig":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Abgeschlossen</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Überfällig</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Bearbeitung</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Offen</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Aufgaben & Checklisten</h2>
          <p className="text-sm text-muted-foreground">({mockEmployees.length === 0 ? '0' : mockEmployees.reduce((acc, e) => acc + e.totalTasks, 0)} Gesamt)</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateTask && (
            <Button onClick={() => setNewTaskDialogOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Neue Aufgabe
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Mitarbeiter, Aufgabe, Verantwortlichem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Mitarbeiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            {mockEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id.toString()}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="overdue">Überfällig</SelectItem>
            <SelectItem value="pending">Offen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alle Kategorien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Dokumente">Dokumente</SelectItem>
            <SelectItem value="Training">Training</SelectItem>
            <SelectItem value="Einarbeitung">Einarbeitung</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alle Prioritäten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Prioritäten</SelectItem>
            <SelectItem value="Hoch">Hoch</SelectItem>
            <SelectItem value="Mittel">Mittel</SelectItem>
            <SelectItem value="Niedrig">Niedrig</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterResponsible} onValueChange={setFilterResponsible}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Verantwortlichen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Verantwortlichen</SelectItem>
            <SelectItem value="IT Team">IT Team</SelectItem>
            <SelectItem value="HR Team">HR Team</SelectItem>
            <SelectItem value="Team Lead">Team Lead</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="DevOps">DevOps</SelectItem>
            <SelectItem value="Legal Team">Legal Team</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilters}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
      </div>

      {/* Selection Bar */}
      {selectedTasks.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">{selectedTasks.length} Aufgabe(n) ausgewählt</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Abschließen
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Neu zuweisen
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-2" />
              Abwählen
            </Button>
          </div>
        </div>
      )}

      {/* Employee Accordion List */}
      <div className="space-y-2">
        {mockEmployees.map((employee) => (
          <Collapsible
            key={employee.id}
            open={expandedEmployees.includes(employee.id)}
            onOpenChange={() => toggleEmployee(employee.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    {expandedEmployees.includes(employee.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{employee.name}</span>
                        <Badge variant="secondary">{employee.position}</Badge>
                        <span className="text-sm text-muted-foreground">{employee.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {employee.startDate}</span>
                    </div>
                    <span className="text-sm">
                      {employee.tasksCompleted} / {employee.totalTasks} Aufgaben
                    </span>
                    <div className="w-24">
                      <Progress value={employee.progress} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-10">{employee.progress}%</span>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t">
                  {employee.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                        />
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.name}
                            </span>
                            {task.status === "completed" && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{task.responsible}</span>
                          </div>
                          {task.status === "completed" && task.completedDate && (
                            <span className="text-xs text-green-600">
                              Abgeschlossen am {task.completedDate} von {task.completedBy}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Fällig: {task.dueDate}
                        </span>
                        <span className="text-sm text-muted-foreground w-24">
                          {task.category}
                        </span>
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                            <DropdownMenuItem>Als erledigt markieren</DropdownMenuItem>
                            <DropdownMenuItem>Neu zuweisen</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  {canCreateTask && (
                    <div className="p-3 border-t">
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => setNewTaskDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aufgabe hinzufügen
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* New Task Dialog */}
      <NewOnboardingTaskDialog
        open={newTaskDialogOpen}
        onOpenChange={setNewTaskDialogOpen}
        employees={mockEmployees}
      />
    </div>
  );
};

const OnboardingChecklistTab = () => {
  const { isEmployee } = useEnterprisePermissions();

  if (isEmployee) {
    return <EmployeeChecklistView />;
  }

  return <AdminChecklistView />;
};

export default OnboardingChecklistTab;