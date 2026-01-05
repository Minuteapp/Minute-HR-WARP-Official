import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DocumentUploadDialog from "@/components/documents/DocumentUploadDialog";
import { 
  Upload, Search, Grid3x3, List, FileText, DollarSign, 
  Heart, Plane, FileSignature, BookOpen, Shield, Clock,
  Eye, AlertCircle, CheckCircle, Trash2, Folder
} from 'lucide-react';
import type { Document } from '@/types/documents';
import { DocumentPreviewWithLinks } from '@/components/documents/DocumentPreviewWithLinks';
import { useNavigate } from 'react-router-dom';
import { DocumentsTableView } from '@/components/documents/DocumentsTableView';
import { AIDocumentSuggestion } from '@/components/documents/AIDocumentSuggestion';
import { FavoriteDocuments } from '@/components/documents/FavoriteDocuments';
import RecentDocuments from '@/components/documents/RecentDocuments';
import { useIsMobile } from '@/hooks/use-device-type';
import { DocumentFilterDialog } from '@/components/documents/DocumentFilterDialog';
import { useDocumentPermissions } from '@/hooks/useDocumentPermissions';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Rollenbasierte Berechtigungen
  const { 
    currentRole, 
    canViewAll, 
    canUpload, 
    canApprove, 
    canViewStats,
    canViewPendingApprovals,
    canViewExpiringDocuments,
    userId,
    isLoading: permissionsLoading 
  } = useDocumentPermissions();

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

  // Statistiken berechnen
  const recentDocuments = documents.filter(doc => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(doc.created_at) >= sevenDaysAgo;
  }).length;

  const pendingApprovals = documents.filter(doc => doc.status === 'pending').length;

  const expiringDocuments = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(doc.expiry_date) <= thirtyDaysFromNow;
  }).length;

  // Kategorien mit dynamischen Dokumentenanzahlen
  const categories = [
    { name: 'Verträge', icon: FileText, color: 'bg-blue-50 text-blue-600', count: documents.filter(d => d.category === 'legal').length },
    { name: 'Lohnabrechnungen', icon: DollarSign, color: 'bg-green-50 text-green-600', count: documents.filter(d => d.category === 'payroll').length },
    { name: 'Krankmeldungen', icon: Heart, color: 'bg-red-50 text-red-600', count: documents.filter(d => d.tags?.includes('krankmeldung')).length },
    { name: 'Weiterbildungsnachweise', icon: BookOpen, color: 'bg-orange-50 text-orange-600', count: documents.filter(d => d.category === 'training').length },
    { name: 'Urlaubsanträge', icon: Plane, color: 'bg-cyan-50 text-cyan-600', count: documents.filter(d => d.tags?.includes('urlaub')).length },
    { name: 'Arbeitszeugnisse', icon: FileSignature, color: 'bg-purple-50 text-purple-600', count: documents.filter(d => d.category === 'recruiting').length },
    { name: 'Richtlinien', icon: BookOpen, color: 'bg-pink-50 text-pink-600', count: documents.filter(d => d.tags?.includes('richtlinie')).length },
    { name: 'Datenschutz', icon: Shield, color: 'bg-indigo-50 text-indigo-600', count: documents.filter(d => d.tags?.includes('datenschutz')).length },
  ];

  const handleUpload = async (file: File, category: string, metadata?: any) => {
    await documentService.uploadDocument(file, {
      title: file.name,
      category: category as any,
      status: (metadata?.status as any) || 'pending',
      requires_approval: metadata?.requires_approval ?? true,
      employee_id: metadata?.employee_id,
      department: metadata?.department,
      document_type: metadata?.document_type,
      approver_id: metadata?.approver_id
    } as any, true);
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Dokumente</h1>
                <p className="text-sm text-muted-foreground">Zentrale Verwaltung aller HR-Dokumente • DSGVO-konform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Suchen..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setViewMode('grid')}>
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              {canUpload && (
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Hochladen
                </Button>
              )}
            </div>
          </div>

          <DocumentsTableView documents={documents} />

          <DocumentUploadDialog
            open={showUploadDialog}
            onOpenChange={setShowUploadDialog}
            onUpload={handleUpload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-2xl font-semibold">Dokumente</h1>
                <p className="text-sm text-muted-foreground">
                  {canViewAll 
                    ? 'Zentrale Verwaltung aller HR-Dokumente • DSGVO-konform • KI-gestützt'
                    : 'Ihre persönlichen Dokumente • DSGVO-konform'}
                </p>
              </div>
              <Badge variant="outline" className="text-xs capitalize ml-2">
                {currentRole === 'superadmin' ? 'Super Admin' : 
                 currentRole === 'admin' ? 'Admin' :
                 currentRole === 'hr' || currentRole === 'hr_admin' ? 'HR Admin' :
                 currentRole === 'manager' ? 'Teamleiter' :
                 currentRole === 'finance_controller' ? 'Finance' :
                 'Mitarbeiter'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Suchen..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <Button variant="default" size="icon" onClick={() => setViewMode('grid')}>
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
            {canUpload && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                {!isMobile && "Hochladen"}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {isMobile && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Suchen..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className={`grid gap-4 ${
          canViewStats ? 'grid-cols-2 md:grid-cols-4' : 
          canViewPendingApprovals && canViewExpiringDocuments ? 'grid-cols-2 md:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2'
        }`}>
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/documents/new')}>
            <div className="flex justify-between items-start mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              {isMobile && <span className="text-lg font-bold">{recentDocuments}</span>}
            </div>
            {!isMobile && <div className="text-3xl font-bold">{recentDocuments}</div>}
            <p className="text-xs text-muted-foreground mt-1">Neue Dokumente</p>
            {!isMobile && <p className="text-xs text-muted-foreground">Letzte 7 Tage</p>}
          </Card>

          {canViewPendingApprovals && (
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/documents/approvals')}>
              <div className="flex justify-between items-start mb-2">
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                {isMobile && <span className="text-lg font-bold">{pendingApprovals}</span>}
              </div>
              {!isMobile && <div className="text-3xl font-bold">{pendingApprovals}</div>}
              <p className="text-xs text-muted-foreground mt-1">Offene Freigaben</p>
              {!isMobile && <p className="text-xs text-muted-foreground">Benötigen Aktion</p>}
            </Card>
          )}

          {canViewExpiringDocuments && (
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/documents/expiring')}>
              <div className="flex justify-between items-start mb-2">
                <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                {isMobile && <span className="text-lg font-bold">{expiringDocuments}</span>}
              </div>
              {!isMobile && <div className="text-3xl font-bold">{expiringDocuments}</div>}
              <p className="text-xs text-muted-foreground mt-1">Ablaufende Dokumente</p>
              {!isMobile && <p className="text-xs text-muted-foreground">Nächste 30 Tage</p>}
            </Card>
          )}

          {canViewStats && (
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/documents/all')}>
              <div className="flex justify-between items-start mb-2">
                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                {isMobile && <span className="text-lg font-bold">{documents.length}</span>}
              </div>
              {!isMobile && <div className="text-3xl font-bold">{documents.length}</div>}
              <p className="text-xs text-muted-foreground mt-1">Gesamt Dokumente</p>
              {!isMobile && <p className="text-xs text-muted-foreground">Im System</p>}
            </Card>
          )}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm font-semibold mb-4">Dokumentenkategorien</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.name} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/documents/category/${category.name.toLowerCase()}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`h-8 w-8 rounded-lg ${category.color} flex items-center justify-center`}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                </div>
                <p className="text-xs font-medium">{category.name}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Schnellzugriff */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/documents/all')}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Folder className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Alle Dokumente</p>
                <p className="text-xs text-muted-foreground">{documents.length} Dateien</p>
              </div>
            </div>
          </Card>
          {canViewStats && (
            <Card 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/documents/trash')}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Papierkorb</p>
                  <p className="text-xs text-muted-foreground">Gelöschte Dokumente</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* AI & Recent */}
        <AIDocumentSuggestion />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FavoriteDocuments />
          <RecentDocuments compact />
        </div>

        <DocumentUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUpload={handleUpload}
        />

        <DocumentPreviewWithLinks
          document={selectedDocument}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
        />
      </div>
    </div>
  );
}