import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  X, Mail, Edit, CheckCircle, Monitor, GraduationCap, MessageSquare,
  Briefcase, Building, MapPin, Calendar, Users, User, Clock,
  FileText, Key, Download, Send
} from "lucide-react";

interface OnboardingEmployee {
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
}

interface OnboardingEmployeeDetailDialogProps {
  employee: OnboardingEmployee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taskCategories = [
  {
    title: "HR & Administration",
    completed: 3,
    total: 5,
    tasks: [
      { name: "Arbeitsvertrag erstellt", completed: true, date: "05.01.2025" },
      { name: "Personalakte angelegt", completed: true, date: "06.01.2025" },
      { name: "Willkommenspaket versandt", completed: true, date: "08.01.2025" },
      { name: "Zeiterfassungskonto eingerichtet", completed: false, dueDate: "15.01.2025" },
      { name: "Sozialversicherung angemeldet", completed: false, dueDate: "16.01.2025" },
    ]
  },
  {
    title: "IT & Technik",
    completed: 2,
    total: 4,
    tasks: [
      { name: "E-Mail-Konto eingerichtet", completed: true, date: "07.01.2025" },
      { name: "Laptop konfiguriert", completed: true, date: "10.01.2025" },
      { name: "VPN-Zugang eingerichtet", completed: false, dueDate: "18.01.2025" },
      { name: "Software-Lizenzen zugewiesen", completed: false, dueDate: "20.01.2025" },
    ]
  },
  {
    title: "Schulung & Einarbeitung",
    completed: 1,
    total: 3,
    tasks: [
      { name: "Unternehmensrichtlinien gelesen", completed: true, date: "09.01.2025" },
      { name: "Abteilungs-Einführung", completed: false, dueDate: "22.01.2025" },
      { name: "Mentor-Gespräch", completed: false, dueDate: "25.01.2025" },
    ]
  }
];

const documents = [
  { name: "Arbeitsvertrag", status: "signed" },
  { name: "Datenschutzerklärung", status: "signed" },
  { name: "Betriebsvereinbarung", status: "pending" },
  { name: "Sozialversicherung", status: "pending" },
];

const hardware = [
  { name: "MacBook Pro 16\"", status: "assigned" },
  { name: "iPhone 15 Pro", status: "ordered" },
  { name: "Büroschlüssel", status: "issued" },
];

const timelineEvents = [
  { date: "05. Jan. 2025", event: "Onboarding-Prozess gestartet", color: "blue" },
  { date: "05. Jan. 2025", event: "Arbeitsvertrag unterzeichnet", color: "green" },
  { date: "07. Jan. 2025", event: "E-Mail-Konto aktiviert", color: "green" },
  { date: "09. Jan. 2025", event: "Erste Schulung abgeschlossen", color: "green" },
  { date: "12. Jan. 2025", event: "Hardware-Lieferung verzögert", color: "yellow" },
];

export function OnboardingEmployeeDetailDialog({ 
  employee, 
  open, 
  onOpenChange 
}: OnboardingEmployeeDetailDialogProps) {
  if (!employee) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
        return null;
    }
  };

  const getDocStatusBadge = (status: string) => {
    if (status === "signed") {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Signiert</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Ausstehend</Badge>;
  };

  const getHardwareStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Zugewiesen</Badge>;
      case "ordered":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Bestellt</Badge>;
      case "issued":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ausgegeben</Badge>;
      default:
        return null;
    }
  };

  const getTimelineColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-500";
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const totalCompleted = taskCategories.reduce((acc, cat) => acc + cat.completed, 0);
  const totalTasks = taskCategories.reduce((acc, cat) => acc + cat.total, 0);
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold">
              {getInitials(employee.name)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{employee.name}</h2>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
            </div>
            <div className="flex gap-2 ml-4">
              {getStatusBadge(employee.status)}
              <Badge variant="outline">{employee.department}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Gesamtfortschritt */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Gesamtfortschritt</h3>
                  <p className="text-sm text-muted-foreground">{totalCompleted} von {totalTasks} Aufgaben abgeschlossen</p>
                </div>
                <span className="text-3xl font-bold text-green-600">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 mb-6" />
              
              <div className="grid grid-cols-4 gap-3">
                <Card className="text-center p-3 bg-green-50 border-green-200">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">Vertrag</p>
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                </Card>
                <Card className="text-center p-3 bg-green-50 border-green-200">
                  <Monitor className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">IT-Zugang</p>
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                </Card>
                <Card className="text-center p-3 bg-gray-50">
                  <GraduationCap className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Schulungen</p>
                </Card>
                <Card className="text-center p-3 bg-gray-50">
                  <MessageSquare className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Feedback</p>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Mitarbeiter-Info & Zuständigkeiten */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Mitarbeiterinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="text-sm font-medium">{employee.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Abteilung</p>
                    <p className="text-sm font-medium">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Standort</p>
                    <p className="text-sm font-medium">{employee.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Startdatum</p>
                    <p className="text-sm font-medium">{employee.startDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Zuständigkeiten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">HR-Verantwortlich</p>
                    <p className="text-sm font-medium">{employee.hr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Buddy</p>
                    <p className="text-sm font-medium">{employee.buddy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Laufzeit</p>
                    <p className="text-sm font-medium">237 Tage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aufgaben-Status */}
          <div className="space-y-4">
            {taskCategories.map((category, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <Badge variant="outline">{category.completed}/{category.total}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.tasks.map((task, taskIdx) => (
                    <div key={taskIdx} className="flex items-center gap-3">
                      <Checkbox checked={task.completed} disabled />
                      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.name}
                      </span>
                      {task.completed ? (
                        <span className="text-xs text-green-600">{task.date}</span>
                      ) : (
                        <span className="text-xs text-orange-600">Fällig: {task.dueDate}</span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dokumente & Hardware */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dokumente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{doc.name}</span>
                    {getDocStatusBadge(doc.status)}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Hardware & Zugänge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hardware.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    {getHardwareStatusBadge(item.status)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${getTimelineColor(event.color)}`} />
                      {idx < timelineEvents.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <p className="text-sm font-medium">{event.event}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-muted/30">
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Reminder senden
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
