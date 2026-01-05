import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { useDocumentPermissions } from '@/hooks/useDocumentPermissions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, FileText, Grid3x3, List, FolderOpen, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '@/types/documents';
import { DocumentPreviewWithLinks } from '@/components/documents/DocumentPreviewWithLinks';
import DocumentRowCard from '@/components/documents/DocumentRowCard';
import { FolderTree } from '@/components/documents/FolderTree';
import { BulkActionsBar } from '@/components/documents/BulkActionsBar';

export default function AllDocumentsPage() {
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderSidebar, setShowFolderSidebar] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const { currentRole, canViewAll, userId, isLoading: permissionsLoading } = useDocumentPermissions();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', currentRole, userId],
    queryFn: () => {
      if (canViewAll) {
        return documentService.getDocuments();
      }
      return documentService.getDocumentsForRole(currentRole, userId || '');
    },
    enabled: !permissionsLoading && !!userId,
  });

  // Alle Kategorien extrahieren
  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category)))];

  // Filtern und Sortieren
  const filteredDocuments = documents
    .filter(doc => selectedCategory === 'all' || doc.category === selectedCategory)
    .filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const handleDocumentClick = (doc: Document) => {
    if (selectionMode) return;
    setSelectedDocument(doc);
    setShowPreviewDialog(true);
  };

  const handleSelectDocument = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(docId => docId !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDocuments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">Alle Dokumente</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredDocuments.length} von {documents.length} Dokumenten
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant={selectionMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds([]);
            }}
          >
            {selectionMode ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
            {selectionMode ? 'Auswahl beenden' : 'Auswählen'}
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Such- und Filterleiste */}
      <div className="flex gap-4">
        {selectionMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedIds.length === filteredDocuments.length ? 'Alle abwählen' : 'Alle auswählen'}
          </Button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Dokumente durchsuchen..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.filter(c => c !== 'all').map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Neueste zuerst</SelectItem>
            <SelectItem value="oldest">Älteste zuerst</SelectItem>
            <SelectItem value="name">Nach Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dokumentenliste */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Dokumente gefunden</h3>
            <p className="text-sm text-muted-foreground">
              Passen Sie Ihre Suchkriterien an oder laden Sie neue Dokumente hoch.
            </p>
          </div>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredDocuments.map((doc: any) => (
            <DocumentRowCard
              key={doc.id}
              id={doc.id}
              filename={doc.file_name}
              title={doc.title}
              author={doc.author_name}
              date={doc.created_at}
              size={doc.file_size}
              category={doc.category}
              filePath={doc.file_path}
              status={doc.status}
              onClick={() => handleDocumentClick(doc)}
              selectable={selectionMode}
              selected={selectedIds.includes(doc.id)}
              onSelect={handleSelectDocument}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc: any) => (
            <DocumentRowCard
              key={doc.id}
              id={doc.id}
              filename={doc.file_name}
              title={doc.title}
              author={doc.author_name}
              date={doc.created_at}
              size={doc.file_size}
              category={doc.category}
              filePath={doc.file_path}
              status={doc.status}
              onClick={() => handleDocumentClick(doc)}
              selectable={selectionMode}
              selected={selectedIds.includes(doc.id)}
              onSelect={handleSelectDocument}
            />
          ))}
        </div>
      )}

      <DocumentPreviewWithLinks
        document={selectedDocument}
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar 
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
