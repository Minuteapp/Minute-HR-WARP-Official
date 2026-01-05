import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import type { DocumentCategory, DocumentStatus } from '@/types/documents';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { DocumentFilterDialog } from '@/components/documents/DocumentFilterDialog';
import type { DocumentFilters } from '@/components/documents/DocumentFilterDialog';
import type { Document } from '@/types/documents';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, Search, Filter, Grid3x3, List, MoreVertical, FileText,
  Upload, Eye, GitBranch, Link as LinkIcon, Archive
} from 'lucide-react';
import { getDocumentCategoryLabel } from '@/types/documents';

// Mapping von deutschen URL-Namen zu DocumentCategory
const CATEGORY_URL_MAP: Record<string, DocumentCategory> = {
  'verträge': 'legal',
  'lohnabrechnungen': 'payroll',
  'krankmeldungen': 'employee',
  'weiterbildungsnachweise': 'training',
  'urlaubsanträge': 'employee',
  'arbeitszeugnisse': 'recruiting',
  'unternehmensdokumente': 'company',
  'mitarbeiterdokumente': 'employee',
  'schulung': 'training',
  'recruiting': 'recruiting'
};

const CategoryPage = () => {
  const { category: urlCategory } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  // Mappe URL-Kategorie auf DocumentCategory
  const category = urlCategory ? (CATEGORY_URL_MAP[urlCategory.toLowerCase()] || urlCategory as DocumentCategory) : undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['documents', category],
    queryFn: () => {
      if (!category) return Promise.resolve([]);
      console.log('Fetching documents for category:', category);
      return documentService.getDocumentsByCategory(category);
    },
    enabled: !!category
  });

  const filteredDocuments = documents.filter(doc => {
    let passes = true;

    if (searchQuery) {
      passes = passes && (
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status Filter mit erweiterten Optionen
    if (statusFilter !== 'all') {
      if (statusFilter === 'signed') {
        passes = passes && doc.signature_status === 'signed';
      } else if (statusFilter === 'expired') {
        passes = passes && doc.expiry_date && new Date(doc.expiry_date) < new Date();
      } else {
        passes = passes && doc.status === statusFilter;
      }
    }

    // Dokumenttyp Filter
    if (typeFilter !== 'all') {
      passes = passes && doc.file_type === typeFilter;
    }

    // Zeitraum Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let filterDate = new Date();
      
      switch(dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      passes = passes && new Date(doc.created_at) >= filterDate;
    }

    if (activeFilters.status) {
      passes = passes && doc.status === activeFilters.status;
    }

    if (activeFilters.dateFrom) {
      passes = passes && new Date(doc.created_at) >= activeFilters.dateFrom;
    }
    if (activeFilters.dateTo) {
      passes = passes && new Date(doc.created_at) <= activeFilters.dateTo;
    }

    return passes;
  });

  const stats = [
    { label: 'Gesamt', value: filteredDocuments.length, color: 'text-foreground', bgColor: 'bg-background' },
    { label: 'Zur Freigabe', value: filteredDocuments.filter(d => d.status === 'pending').length, color: 'text-yellow-800', bgColor: 'bg-yellow-50 border-yellow-200' },
    { label: 'Freigegeben', value: filteredDocuments.filter(d => d.status === 'approved').length, color: 'text-green-800', bgColor: 'bg-green-50 border-green-200' },
    { label: 'Signiert', value: filteredDocuments.filter(d => d.signature_status === 'signed').length, color: 'text-blue-800', bgColor: 'bg-blue-50 border-blue-200' },
  ];

  const handleUpload = async (file: File, uploadCategory: string, metadata?: {
    employee_id?: string;
    department?: string;
    document_type?: string;
    requires_approval?: boolean;
    approver_id?: string;
    status?: string;
    ai_summary?: string;
    ai_tags?: string[];
    ai_confidence?: number;
    ai_detected_entities?: object;
    ai_invoice_data?: object;
  }) => {
    try {
      console.log('Uploading document from category page...', { file: file.name, category: uploadCategory, metadata });
      
      await documentService.uploadDocument(file, {
        title: file.name,
        category: uploadCategory as DocumentCategory,
        status: (metadata?.status || 'pending') as DocumentStatus,
        version: 1,
        requires_approval: metadata?.requires_approval ?? true,
        employee_id: metadata?.employee_id,
        department: metadata?.department,
        document_type: metadata?.document_type,
        // KI-Analyse-Daten speichern
        description: metadata?.ai_summary,
        tags: metadata?.ai_tags,
        metadata: {
          ai_analysis: {
            summary: metadata?.ai_summary,
            confidence: metadata?.ai_confidence,
            tags: metadata?.ai_tags,
            detected_entities: metadata?.ai_detected_entities,
            invoice_data: metadata?.ai_invoice_data
          }
        }
      });
      
      toast.success("Dokument erfolgreich hochgeladen");
      await refetch();
      setShowUploadDialog(false);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      const errorMessage = error?.message || "Fehler beim Hochladen des Dokuments";
      toast.error(errorMessage);
    }
  };

  const handleDocumentClick = (document: Document) => {
    navigate(`/documents/detail/${document.id}`);
  };

  const handleFilter = (filters: DocumentFilters) => {
    setActiveFilters(filters);
  };

  const getStatusBadge = (status: string, signatureStatus?: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Entwurf', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      pending: { label: 'Zur Freigabe', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      approved: { label: 'Freigegeben', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      rejected: { label: 'Abgelehnt', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      archived: { label: 'Archiviert', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      signed: { label: 'Signiert', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      expired: { label: 'Abgelaufen', className: 'bg-red-100 text-red-800 hover:bg-red-100' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (!category) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Ungültige Kategorie</p>
      </div>
    );
  }

  console.log('Rendering category page with:', { urlCategory, mappedCategory: category, documentsCount: documents.length });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate('/documents')} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Dashboard
              </Button>
              <h1 className="text-2xl font-bold">{getDocumentCategoryLabel(category)}</h1>
              <p className="text-muted-foreground">Alle verträge im Überblick</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <List className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Dokument hochladen
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className={`p-4 border ${stat.bgColor}`}>
                <div className="text-sm">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="KI-gestützte Suche: z.B. 'Zeige alle Verträge von Anna Müller aus 2024'"
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter</span>
                <Button variant="link" size="sm" className="h-auto p-0">
                  Zurücksetzen
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dokumenttyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="Vertrag">Vertrag</SelectItem>
                  <SelectItem value="Lohnabrechnung">Lohnabrechnung</SelectItem>
                  <SelectItem value="Krankmeldung">Krankmeldung</SelectItem>
                  <SelectItem value="Weiterbildungsnachweis">Weiterbildungsnachweis</SelectItem>
                  <SelectItem value="Urlaubsantrag">Urlaubsantrag</SelectItem>
                  <SelectItem value="Arbeitszeugnis">Arbeitszeugnis</SelectItem>
                  <SelectItem value="Richtlinie">Richtlinie</SelectItem>
                  <SelectItem value="Datenschutz">Datenschutz</SelectItem>
                  <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="pending">Zur Freigabe</SelectItem>
                  <SelectItem value="approved">Freigegeben</SelectItem>
                  <SelectItem value="signed">Signiert</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                  <SelectItem value="expired">Abgelaufen</SelectItem>
                  <SelectItem value="archived">Archiviert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                  {/* ZERO-DATA: Mitarbeiter dynamisch aus DB laden */}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Gesamter Zeitraum</SelectItem>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                  <SelectItem value="quarter">Dieses Quartal</SelectItem>
                  <SelectItem value="year">Dieses Jahr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Abteilung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt von</TableHead>
                    <TableHead>Letzte Änderung</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow 
                      key={doc.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            {doc.requires_signature && (
                              <Badge variant="outline" className="text-xs">Signatur</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.file_type || 'Vertrag'}</TableCell>
                      <TableCell>Anna Müller</TableCell>
                      <TableCell>Sales</TableCell>
                      <TableCell>{getStatusBadge(doc.status, doc.signature_status)}</TableCell>
                      <TableCell>Sarah Schmidt</TableCell>
                      <TableCell>{new Date(doc.updated_at).toLocaleDateString('de-DE')}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/documents/detail/${doc.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Öffnen
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <GitBranch className="h-4 w-4 mr-2" />
                              Versionen anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Verknüpfungen
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archivieren
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredDocuments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Keine Dokumente gefunden
              </div>
            )}
          </Card>
        </div>
      </main>

        <DocumentUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUpload={handleUpload}
          defaultCategory={category}
        />

      <DocumentFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onFilter={handleFilter}
      />
    </div>
  );
};

export default CategoryPage;

