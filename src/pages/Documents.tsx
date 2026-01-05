import { useState, useEffect } from "react";
import { Plus, Search, Filter, Upload, FolderOpen, FileText, Eye, Download, Share2, MoreHorizontal, Tag, Calendar, AlertCircle, CheckCircle, Clock, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DocumentUploadDialog from "@/components/documents/DocumentUploadDialog";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentPreview from "@/components/documents/DocumentPreview";
import DocumentFilters from "@/components/documents/DocumentFilters";
import BulkUploadDialog from "@/components/documents/BulkUploadDialog";
import DocumentTemplates from "@/components/documents/DocumentTemplates";
import DocumentStats from "@/components/documents/DocumentStats";
import DocumentReminders from "@/components/documents/DocumentReminders";
import { Document } from "@/types/documents";


const Documents = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState<any>(null);
  const itemsPerPage = 20;

  const categories = [
    { value: "all", label: "Alle Kategorien" },
    { value: "contract", label: "Verträge" },
    { value: "certificate", label: "Zertifikate" },
    { value: "training", label: "Schulungen" },
    { value: "identification", label: "Ausweise" },
    { value: "policy", label: "Richtlinien" },
    { value: "payroll", label: "Lohn & Gehalt" },
    { value: "visa", label: "Visa" },
    { value: "permit", label: "Genehmigungen" },
    { value: "onboarding", label: "Onboarding" },
    { value: "compliance", label: "Compliance" },
    { value: "template", label: "Vorlagen" },
    { value: "other", label: "Sonstiges" }
  ];

  const statuses = [
    { value: "all", label: "Alle Status" },
    { value: "draft", label: "Entwurf" },
    { value: "approved", label: "Freigegeben" },
    { value: "expired", label: "Abgelaufen" },
    { value: "archived", label: "Archiviert" }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory, selectedStatus, advancedFilters]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_current_version', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Dokumente:', error);
      toast({
        title: "Fehler",
        description: "Dokumente konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Text-Suche
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Kategorie-Filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Status-Filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    // Erweiterte Filter anwenden
    if (advancedFilters) {
      // Datums-Filter
      if (advancedFilters.dateRange?.from) {
        filtered = filtered.filter(doc => 
          new Date(doc.created_at) >= advancedFilters.dateRange.from
        );
      }
      if (advancedFilters.dateRange?.to) {
        filtered = filtered.filter(doc => 
          new Date(doc.created_at) <= advancedFilters.dateRange.to
        );
      }

      // Dateityp-Filter
      if (advancedFilters.fileTypes?.length > 0) {
        filtered = filtered.filter(doc => 
          advancedFilters.fileTypes.includes(doc.file_type)
        );
      }

      // Tag-Filter
      if (advancedFilters.tags?.length > 0) {
        filtered = filtered.filter(doc => 
          doc.tags.some(tag => advancedFilters.tags.includes(tag))
        );
      }

      // Dateigröße-Filter (in MB)
      if (advancedFilters.sizeRange?.min) {
        const minBytes = parseFloat(advancedFilters.sizeRange.min) * 1024 * 1024;
        filtered = filtered.filter(doc => doc.file_size >= minBytes);
      }
      if (advancedFilters.sizeRange?.max) {
        const maxBytes = parseFloat(advancedFilters.sizeRange.max) * 1024 * 1024;
        filtered = filtered.filter(doc => doc.file_size <= maxBytes);
      }

      // Sichtbarkeits-Filter
      if (advancedFilters.visibilityLevel && advancedFilters.visibilityLevel !== 'all') {
        filtered = filtered.filter(doc => doc.visibility_level === advancedFilters.visibilityLevel);
      }

      // Ablaufdatum-Filter
      if (advancedFilters.hasExpiry !== null) {
        filtered = filtered.filter(doc => 
          advancedFilters.hasExpiry ? !!doc.expiry_date : !doc.expiry_date
        );
      }

      // Signatur-Filter
      if (advancedFilters.requiresSignature !== null) {
        filtered = filtered.filter(doc => 
          doc.requires_signature === advancedFilters.requiresSignature
        );
      }
    }

    setFilteredDocuments(filtered);
    setCurrentPage(1);
  };

  const handleDocumentUpload = async (uploadedDoc: any) => {
    setDocuments(prev => [uploadedDoc, ...prev]);
    setShowUpload(false);
    toast({
      title: "Erfolg",
      description: "Dokument wurde erfolgreich hochgeladen",
    });
  };

  const handleDocumentUpdate = (updatedDoc: Document) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
    );
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Erfolg",
        description: "Dokument wurde gelöscht",
      });
    } catch (error: any) {
      console.error('Fehler beim Löschen:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dokumente</h1>
            <p className="text-muted-foreground">Verwalten Sie alle Ihre Dokumente zentral</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dokumente</h1>
          <p className="text-muted-foreground">
            {filteredDocuments.length} von {documents.length} Dokumenten
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Massen-Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Massen-Upload</DialogTitle>
              </DialogHeader>
              <BulkUploadDialog 
                onClose={() => setShowBulkUpload(false)}
                onUploadComplete={fetchDocuments}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Dokument hochladen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neues Dokument hochladen</DialogTitle>
              </DialogHeader>
              <DocumentUploadDialog 
                open={showUpload}
                onOpenChange={setShowUpload}
                onUpload={handleDocumentUpload}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiken */}
      <DocumentStats />

      {/* Erinnerungen */}
      <DocumentReminders />

      {/* Tabs für verschiedene Bereiche */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Alle Dokumente</TabsTrigger>
          <TabsTrigger value="favorites">Favoriten</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="pending">Ausstehend</TabsTrigger>
          <TabsTrigger value="expired">Abgelaufen</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Suchleiste und Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dokumente durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status wählen" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Erweiterte Filter */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <DocumentFilters 
                  onFiltersChange={(filters) => {
                    setAdvancedFilters(filters);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Dokumente-Grid */}
          {paginatedDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Dokumente gefunden</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {documents.length === 0 
                    ? "Laden Sie Ihr erstes Dokument hoch, um zu beginnen."
                    : "Versuchen Sie, Ihre Suchkriterien anzupassen."
                  }
                </p>
                {documents.length === 0 && (
                  <Button onClick={() => setShowUpload(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erstes Dokument hochladen
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onUpdate={handleDocumentUpdate}
                  onDelete={handleDocumentDelete}
                  onPreview={setSelectedDocument}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Zurück
              </Button>
              
              <div className="flex items-center space-x-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Weiter
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents
              .filter(doc => (doc.metadata as any)?.is_favorite === true)
              .map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onUpdate={handleDocumentUpdate}
                  onDelete={handleDocumentDelete}
                  onPreview={setSelectedDocument}
                />
              ))}
            {documents.filter(doc => (doc.metadata as any)?.is_favorite === true).length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Favoriten</h3>
                  <p className="text-muted-foreground text-center">
                    Markieren Sie Dokumente als Favorit über das Stern-Symbol.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <DocumentTemplates />
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents
              .filter(doc => doc.requires_signature && doc.signature_status === 'pending')
              .map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onUpdate={handleDocumentUpdate}
                  onDelete={handleDocumentDelete}
                  onPreview={setSelectedDocument}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents
              .filter(doc => doc.expiry_date && new Date(doc.expiry_date) < new Date())
              .map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onUpdate={handleDocumentUpdate}
                  onDelete={handleDocumentDelete}
                  onPreview={setSelectedDocument}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dokument-Vorschau */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdate={handleDocumentUpdate}
        />
      )}
    </div>
  );
};

export default Documents;