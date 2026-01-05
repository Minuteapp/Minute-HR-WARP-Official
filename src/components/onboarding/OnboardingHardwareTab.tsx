import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Layers,
  Search,
  Clipboard,
  Download,
  MoreHorizontal,
  Monitor,
  Smartphone,
  Key,
  Globe,
  Box,
} from "lucide-react";
import OnboardingHardwareDetailView from "./OnboardingHardwareDetailView";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

interface HardwareItem {
  id: number;
  employee: {
    name: string;
    position: string;
    initials: string;
    department: string;
  };
  hardware: string;
  specs: string;
  serialNumber: string;
  category: string;
  status: 'confirmed' | 'assigned' | 'pending' | 'returned';
  assignedDate: string;
  confirmedDate: string | null;
}

const mockHardware: HardwareItem[] = [];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Laptop": return Monitor;
    case "Smartphone": return Smartphone;
    case "Zugang": return Key;
    case "Software": return Globe;
    case "Sonstiges": return Box;
    default: return Box;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">Bestätigt</Badge>;
    case "assigned":
      return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">Zugewiesen</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-100">Ausstehend</Badge>;
    case "returned":
      return <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100">Zurückgegeben</Badge>;
    default:
      return null;
  }
};

// Mitarbeiter-spezifische Ansicht
const EmployeeHardwareView = () => {
  const myHardware: HardwareItem[] = [];

  const kpiCards = [
    { label: "Erhalten", value: "0", icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Zugewiesen", value: "0", icon: Clock, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Ausstehend", value: "0", icon: AlertCircle, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header für Mitarbeiter */}
      <div>
        <h2 className="text-xl font-semibold">Meine Hardware & Zugänge</h2>
        <p className="text-sm text-muted-foreground">Deine zugewiesene Hardware und IT-Zugänge</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hardware-Liste */}
      <Card>
        <CardContent className="p-4">
          {myHardware.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Keine Hardware zugewiesen</p>
              <p className="text-sm">Deine Hardware und Zugänge werden hier angezeigt.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myHardware.map((item) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.hardware}</p>
                        <p className="text-sm text-muted-foreground">{item.specs}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Admin/HR Ansicht
const AdminHardwareView = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedHardware, setSelectedHardware] = useState<HardwareItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(mockHardware.map(h => h.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(i => i !== id));
    }
  };

  const handleRowClick = (hardware: HardwareItem) => {
    setSelectedHardware(hardware);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedHardware(null);
  };

  if (view === 'detail' && selectedHardware) {
    return <OnboardingHardwareDetailView hardware={selectedHardware} onBack={handleBack} />;
  }

  return (
    <div className="space-y-4">
      {/* KI-Hardware-Analyse Box */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-start gap-3">
        <div className="p-2 bg-violet-100 rounded-lg">
          <Sparkles className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <span className="font-medium text-violet-900">KI-Hardware-Analyse: </span>
          <span className="text-violet-800">
            Keine Hardware-Zuweisungen vorhanden. Weisen Sie Mitarbeitern Hardware zu, um eine Analyse zu erhalten.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bestätigt</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">0% abgeschlossen</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zugewiesen</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">In Vorbereitung</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Zu erledigen</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Positionen</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-lg">
                <Layers className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
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
            placeholder="Suchen nach Mitarbeiter, Hardware, Beschreibung..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="assigned">Zugewiesen</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="returned">Zurückgegeben</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="laptop">Laptop</SelectItem>
              <SelectItem value="smartphone">Smartphone</SelectItem>
              <SelectItem value="zugang">Zugang</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="sonstiges">Sonstiges</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Abteilungen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              <SelectItem value="vertrieb">Vertrieb</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">0 Ergebnisse</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Einträge pro Seite:</span>
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

      {/* Hardware Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.length === mockHardware.length && mockHardware.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Hardware/Zugang</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Zugewiesen</TableHead>
              <TableHead>Bestätigt</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHardware.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category);
              return (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {item.employee.initials}
                      </div>
                      <div>
                        <p className="font-medium">{item.employee.name}</p>
                        <p className="text-sm text-muted-foreground">{item.employee.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.hardware}</p>
                        <p className="text-sm text-muted-foreground">{item.specs}</p>
                        <p className="text-xs text-muted-foreground">S/N: {item.serialNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.assignedDate}</span>
                  </TableCell>
                  <TableCell>
                    {item.confirmedDate ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{item.confirmedDate}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem>E-Mail senden</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Zurückgeben</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

const OnboardingHardwareTab = () => {
  const { isEmployee } = useEnterprisePermissions();

  if (isEmployee) {
    return <EmployeeHardwareView />;
  }

  return <AdminHardwareView />;
};

export default OnboardingHardwareTab;