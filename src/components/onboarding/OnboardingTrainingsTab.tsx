import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Brain,
  CheckCircle,
  PlayCircle,
  Award,
  AlertCircle,
  Search,
  Clipboard,
  ChevronDown,
  Download,
  Plus,
  MoreHorizontal,
  Clock,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { OnboardingTrainingDetailView } from './OnboardingTrainingDetailView';
import { AssignTrainingDialog } from './AssignTrainingDialog';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';

interface Training {
  id: number;
  employee: {
    name: string;
    position: string;
    initials: string;
    department: string;
  };
  course: string;
  duration: string;
  type: 'Pflicht' | 'Rollenspezifisch' | 'Empfohlen';
  status: 'completed' | 'in_progress' | 'overdue';
  progress: number;
  dueDate: string;
  completedDate: string | null;
  hasCertificate: boolean;
}

const mockTrainings: Training[] = [];

const kpiCards = [
  { label: "Abgeschlossen", value: "0", subtitle: "von 0 Kursen", icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "In Bearbeitung", value: "0", subtitle: "aktive Schulungen", icon: PlayCircle, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Zertifikate", value: "0", subtitle: "ausgestellt", icon: Award, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { label: "Überfällig", value: "0", subtitle: "Erfordert Aktion", icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600" }
];

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case 'Pflicht':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Rollenspezifisch':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Empfohlen':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'overdue':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Abgeschlossen';
    case 'in_progress':
      return 'In Bearbeitung';
    case 'overdue':
      return 'Überfällig';
    default:
      return status;
  }
};

export const OnboardingTrainingsTab: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const { hasAction, isEmployee } = useEnterprisePermissions();
  const canAssignTrainings = hasAction('onboarding', 'create') || hasAction('onboarding', 'approve');

  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedTraining(null);
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === mockTrainings.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockTrainings.map(t => t.id));
    }
  };

  if (view === 'detail' && selectedTraining) {
    return (
      <OnboardingTrainingDetailView
        training={selectedTraining}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KI-Schulungsanalyse Box - Nur für HR/Admin */}
      {!isEmployee && (
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Brain className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <span className="font-medium text-violet-900">KI-Schulungsanalyse: </span>
                <span className="text-violet-700">
                  Keine Schulungsdaten vorhanden. Weisen Sie Mitarbeitern Schulungen zu, um eine Analyse zu erhalten.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI-Karten */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${card.iconBg}`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aktions-Buttons - Nur für HR/Admin */}
      {!isEmployee && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Clipboard className="h-4 w-4 mr-2" />
              Filter speichern
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  System Administrator
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>System Administrator</DropdownMenuItem>
                <DropdownMenuItem>HR Manager</DropdownMenuItem>
                <DropdownMenuItem>Team Lead</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Suchfeld und Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Mitarbeiter, Kurs, Position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="overdue">Überfällig</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Typen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="Pflicht">Pflicht</SelectItem>
            <SelectItem value="Rollenspezifisch">Rollenspezifisch</SelectItem>
            <SelectItem value="Empfohlen">Empfohlen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="Vertrieb">Vertrieb</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>

        {canAssignTrainings && (
          <Button onClick={() => setAssignDialogOpen(true)} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Schulung zuweisen
          </Button>
        )}
      </div>

      {/* Ergebnis-Anzeige */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{isEmployee ? 'Meine Schulungen' : '0 Ergebnisse'}</span>
        <div className="flex items-center gap-2">
          <span>Einträge pro Seite:</span>
          <Select defaultValue="25">
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schulungen-Tabelle */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left">
                    <Checkbox
                      checked={selectedItems.length === mockTrainings.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Mitarbeiter</th>
                  <th className="p-3 text-left text-sm font-medium">Kurs</th>
                  <th className="p-3 text-left text-sm font-medium">Typ</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Fortschritt</th>
                  <th className="p-3 text-left text-sm font-medium">Fällig</th>
                  <th className="p-3 text-left text-sm font-medium">Zertifikat</th>
                  <th className="p-3 text-left text-sm font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {mockTrainings.map((training) => (
                  <tr 
                    key={training.id} 
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleTrainingClick(training)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(training.id)}
                        onCheckedChange={() => toggleSelectItem(training.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {training.employee.initials}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{training.employee.name}</p>
                          <p className="text-xs text-muted-foreground">{training.employee.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-sm">{training.course}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {training.duration}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={getTypeBadgeStyles(training.type)}>
                        {training.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={getStatusBadgeStyles(training.status)}>
                        {getStatusLabel(training.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={training.progress} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{training.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <p>{training.dueDate}</p>
                        {training.completedDate && (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <Clock className="h-3 w-3" />
                            {training.completedDate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {training.hasCertificate ? (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Award className="h-4 w-4" />
                          <span className="text-sm">Ja</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                          <DropdownMenuItem>Erinnerung senden</DropdownMenuItem>
                          <DropdownMenuItem>Zertifikat herunterladen</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Schulung entfernen</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Seite 1 von 2.000 (1 - 25 von 50.000)
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">4</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">5</Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KI-Empfehlung Box */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-violet-900">KI-Empfehlung: Automatisierte Lernpfade</h4>
              <p className="text-sm text-violet-700 mt-1">
                Basierend auf 5k+ Datenpunkten empfehlen wir, Lernpfade automatisch beim Onboarding-Start zuzuweisen. Dies reduziert manuelle Arbeit um 75% und verbessert die Abschlussrate um 42%.
              </p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700">
              Automatisierung aktivieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assign Training Dialog */}
      <AssignTrainingDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </div>
  );
};
