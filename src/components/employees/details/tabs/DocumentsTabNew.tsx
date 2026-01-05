import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployeeDocuments } from '@/hooks/employee-tabs/useEmployeeDocuments';
import { DocumentUploadDialog } from '../dialogs/DocumentUploadDialog';
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  Search,
  Receipt,
  Award,
  GraduationCap,
  Shield,
  CreditCard,
  FileCheck,
  Building,
  File
} from 'lucide-react';

interface DocumentsTabNewProps {
  employeeId: string;
}

const DOCUMENT_TYPE_CONFIG = {
  contract: { label: 'Verträge', icon: FileText, color: 'bg-blue-500' },
  payslip: { label: 'Gehaltsabrechnungen', icon: Receipt, color: 'bg-green-500' },
  certificate: { label: 'Zertifikate', icon: Award, color: 'bg-purple-500' },
  training: { label: 'Schulungsnachweise', icon: GraduationCap, color: 'bg-orange-500' },
  privacy: { label: 'Datenschutz', icon: Shield, color: 'bg-red-500' },
  identification: { label: 'Ausweisdokumente', icon: CreditCard, color: 'bg-yellow-500' },
  tax: { label: 'Steuerdokumente', icon: FileCheck, color: 'bg-indigo-500' },
  insurance: { label: 'Versicherungen', icon: Building, color: 'bg-pink-500' },
  other: { label: 'Sonstiges', icon: File, color: 'bg-gray-500' },
};

export const DocumentsTabNew = ({ employeeId }: DocumentsTabNewProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    isUploading,
  } = useEmployeeDocuments(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = !selectedCategory || doc.document_type === selectedCategory;
    const matchesSearch = !searchQuery || 
      doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = documents.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6">
      {/* Sidebar */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Kategorien</h3>
            <Badge variant="secondary">{documents.length}</Badge>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                !selectedCategory ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <span className="text-sm font-medium">Alle Dokumente</span>
              <Badge variant="secondary" className="ml-2">{documents.length}</Badge>
            </button>
            
            {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => {
              const count = categoryCounts[type] || 0;
              const Icon = config.icon;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedCategory(type)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                    selectedCategory === type ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${config.color} text-white`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{config.label}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">{count}</Badge>
                </button>
              );
            })}
          </div>
        </Card>

        <Button onClick={() => setUploadDialogOpen(true)} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          Dokument hochladen
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Dokumente durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Documents List */}
        <Card className="p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Keine Dokumente gefunden' : 'Noch keine Dokumente vorhanden'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map(doc => {
                const config = DOCUMENT_TYPE_CONFIG[doc.document_type];
                const Icon = config.icon;
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded ${config.color} text-white shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{doc.document_name}</p>
                          {doc.is_confidential && (
                            <Badge variant="destructive" className="shrink-0">Vertraulich</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{config.label}</span>
                          {doc.category && (
                            <>
                              <span>•</span>
                              <span>{doc.category}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString('de-DE')}</span>
                          {doc.expiry_date && (
                            <>
                              <span>•</span>
                              <span className={
                                new Date(doc.expiry_date) < new Date() 
                                  ? 'text-red-600 font-medium' 
                                  : ''
                              }>
                                Gültig bis: {new Date(doc.expiry_date).toLocaleDateString('de-DE')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 shrink-0 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        title="Ansehen"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadDocument(doc.file_url, doc.document_name)}
                        title="Herunterladen"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Dokument wirklich löschen?')) {
                            deleteDocument(doc.id);
                          }
                        }}
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={(file, metadata) => uploadDocument({ file, metadata })}
        isUploading={isUploading}
      />
    </div>
  );
};
