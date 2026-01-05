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
  CheckCircle, 
  Edit, 
  FileText, 
  Clipboard,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  Clock
} from "lucide-react";
import OnboardingDocumentDetailView from "./OnboardingDocumentDetailView";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

interface Document {
  id: number;
  employee: {
    name: string;
    position: string;
    initials: string;
  };
  document: string;
  size: string;
  category: string;
  type: string;
  status: 'signed' | 'rejected';
  uploadDate: string;
  uploadedBy: string;
  signedDate: string | null;
  department: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
}

const mockDocuments: Document[] = [];

// Mitarbeiter-spezifische Ansicht
const EmployeeDocumentsView = () => {
  const myDocuments: Document[] = [];

  const kpiCards = [
    { label: "Signiert", value: "0", icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Ausstehend", value: "0", icon: Edit, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
    { label: "Entwürfe", value: "0", icon: FileText, iconBg: "bg-gray-100", iconColor: "text-gray-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header für Mitarbeiter */}
      <div>
        <h2 className="text-xl font-semibold">Meine Dokumente</h2>
        <p className="text-sm text-muted-foreground">Deine Onboarding-Dokumente und Verträge</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dokumentenliste */}
      <Card>
        <CardContent className="p-4">
          {myDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Keine Dokumente vorhanden</p>
              <p className="text-sm">Deine Onboarding-Dokumente werden hier angezeigt.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.document}</p>
                      <p className="text-sm text-muted-foreground">{doc.category} • {doc.size}</p>
                    </div>
                  </div>
                  <Badge className={doc.status === 'signed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {doc.status === 'signed' ? 'Signiert' : 'Ausstehend'}
                  </Badge>
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
const AdminDocumentsView = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [entriesPerPage, setEntriesPerPage] = useState("25");

  const kpiCards = [
    { label: "Signierte Dokumente", value: "0", subtitle: "0% aller Dokumente", icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Signatur ausstehend", value: "0", subtitle: "Erfordert Aktion", icon: Edit, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
    { label: "Entwürfe", value: "0", subtitle: "Nicht finalisiert", icon: FileText, iconBg: "bg-gray-100", iconColor: "text-gray-600" },
    { label: "Vollständigkeit", value: "0%", subtitle: null, icon: Sparkles, iconBg: "bg-blue-100", iconColor: "text-blue-600", hasProgress: true }
  ];

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDocument(null);
  };

  const toggleDocumentSelection = (id: number) => {
    setSelectedDocuments(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === mockDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(mockDocuments.map(d => d.id));
    }
  };

  if (view === 'detail' && selectedDocument) {
    return (
      <OnboardingDocumentDetailView 
        document={selectedDocument} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KI-Dokumentenanalyse Box */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-violet-800">
          <span className="font-medium">KI-Dokumentenanalyse:</span>{" "}
          Keine Dokumente vorhanden. Laden Sie Dokumente hoch, um eine Analyse zu erhalten.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                  )}
                  {kpi.hasProgress && (
                    <Progress value={0} className="h-2 mt-2" />
                  )}
                </div>
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">
          <Clipboard className="h-4 w-4 mr-2" />
          Filter speichern
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Mitarbeiter, Dokument, Typ, Abteilung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20"
          />
          <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white hover:bg-gray-900">
            Vorschau
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="signed">Signiert</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="rejected">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="vertraege">Verträge</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="personalakten">Personalakten</SelectItem>
              <SelectItem value="finanzen">Finanzen</SelectItem>
              <SelectItem value="schulungen">Schulungen</SelectItem>
              <SelectItem value="bewerbung">Bewerbung</SelectItem>
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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>0 Ergebnisse</span>
        <div className="flex items-center gap-2">
          <span>Einträge pro Seite:</span>
          <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
            <SelectTrigger className="w-[70px] h-8">
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

      {/* Documents Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedDocuments.length === mockDocuments.length && mockDocuments.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Dokument</TableHead>
              <TableHead>Kategorie & Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hochgeladen</TableHead>
              <TableHead>Signiert</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDocuments.map((doc) => (
              <TableRow 
                key={doc.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleDocumentClick(doc)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={() => toggleDocumentSelection(doc.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {doc.employee.initials}
                    </div>
                    <div>
                      <p className="font-medium">{doc.employee.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.employee.position}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{doc.document}</p>
                    <p className="text-sm text-muted-foreground">{doc.size}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {doc.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      doc.status === 'signed' 
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" 
                        : "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                    }
                  >
                    {doc.status === 'signed' ? 'Signiert' : 'Abgelehnt'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{doc.uploadDate}</p>
                    <p className="text-sm text-muted-foreground">von {doc.uploadedBy}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {doc.signedDate ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{doc.signedDate}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Herunterladen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

const OnboardingDocumentsTab = () => {
  const { isEmployee } = useEnterprisePermissions();

  if (isEmployee) {
    return <EmployeeDocumentsView />;
  }

  return <AdminDocumentsView />;
};

export default OnboardingDocumentsTab;