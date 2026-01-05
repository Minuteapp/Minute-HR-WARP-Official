import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Calendar, AlertTriangle, Filter, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentViewDialog from './DocumentViewDialog';
import { useToast } from '@/hooks/use-toast';

interface DocumentTabContentProps {
  employeeId: string;
}

const DocumentTabContent: React.FC<DocumentTabContentProps> = ({ employeeId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const { toast } = useToast();

  // Fetch employee documents
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          employee_document_types(name, category, requires_expiry)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch document types for filtering
  const { data: documentTypes = [] } = useQuery({
    queryKey: ['employee-document-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_document_types')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.employee_document_types?.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'pending': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'identification': return 'bg-green-100 text-green-800';
      case 'certificate': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if document is expiring soon
  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Handle document download
  const handleDownload = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(document.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download erfolgreich",
        description: `${document.title} wurde heruntergeladen.`,
      });
    } catch (error) {
      toast({
        title: "Download fehlgeschlagen",
        description: "Das Dokument konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    }
  };

  // Group documents by category
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    const category = doc.employee_document_types?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Dokumente</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie alle Mitarbeiterdokumente an einem Ort
          </p>
        </div>
        
        <Button onClick={() => setShowUploadDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Dokument hochladen
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Dokumente durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="contract">Verträge</SelectItem>
                <SelectItem value="identification">Ausweise</SelectItem>
                <SelectItem value="certificate">Zertifikate</SelectItem>
                <SelectItem value="training">Fortbildung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="expired">Abgelaufen</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Läuft ab</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => isExpiringSoon(d.expiry_date)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abgelaufen</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => isExpired(d.expiry_date)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Dokumente gefunden</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'Passen Sie Ihre Filter an oder suchen Sie nach anderen Begriffen.'
                : 'Laden Sie das erste Dokument für diesen Mitarbeiter hoch.'
              }
            </p>
            {(!searchTerm && filterCategory === 'all' && filterStatus === 'all') && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Dokument hochladen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(documentsByCategory).map(([category, categoryDocs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base capitalize flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(category)}`}>
                    {category === 'contract' && 'Verträge'}
                    {category === 'identification' && 'Ausweise'}
                    {category === 'certificate' && 'Zertifikate'}
                    {category === 'training' && 'Fortbildung'}
                    {category === 'other' && 'Sonstiges'}
                  </div>
                  <span className="text-muted-foreground">({Array.isArray(categoryDocs) ? categoryDocs.length : 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {Array.isArray(categoryDocs) && categoryDocs.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{document.title}</h4>
                            {isExpired(document.expiry_date) && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Abgelaufen
                              </Badge>
                            )}
                            {isExpiringSoon(document.expiry_date) && !isExpired(document.expiry_date) && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Läuft ab
                              </Badge>
                            )}
                          </div>
                          
                          {document.description && (
                            <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Hochgeladen: {format(new Date(document.created_at), 'dd.MM.yyyy', { locale: de })}</span>
                            {document.expiry_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Gültig bis: {format(new Date(document.expiry_date), 'dd.MM.yyyy', { locale: de })}
                              </span>
                            )}
                            <Badge variant={getStatusVariant(document.status)} className="text-xs">
                              {document.status === 'active' && 'Aktiv'}
                              {document.status === 'expired' && 'Abgelaufen'}
                              {document.status === 'pending' && 'Ausstehend'}
                              {document.status === 'archived' && 'Archiviert'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <DocumentUploadDialog 
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        employeeId={employeeId}
        onSuccess={() => {
          refetch();
          setShowUploadDialog(false);
        }}
      />

      {/* View Dialog */}
      <DocumentViewDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
};

export default DocumentTabContent;