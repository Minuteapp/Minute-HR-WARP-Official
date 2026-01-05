import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DocumentUploadDialog from "@/components/documents/DocumentUploadDialog";
import { 
  Upload, Search, Grid3x3, List, FileText, DollarSign, 
  Heart, Plane, FileSignature, BookOpen, Shield, Clock,
  Eye, AlertCircle, CheckCircle, Sparkles, ArrowRight, File
} from 'lucide-react';
import type { Document } from '@/types/documents';
import { DocumentPreviewWithLinks } from '@/components/documents/DocumentPreviewWithLinks';
import { useNavigate } from 'react-router-dom';

export default function DocumentOverviewPage() {
  const navigate = useNavigate();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
  });

  // Statistiken berechnen
  const recentDocuments = documents.filter(doc => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(doc.created_at) >= sevenDaysAgo;
  }).length;

  const pendingApprovals = documents.filter(doc => doc.status === 'pending' && doc.requires_approval).length;

  const expiringDocuments = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(doc.expiry_date) <= thirtyDaysFromNow;
  }).length;

  // Kategorien mit Dokumentenanzahl
  const categories = [
    { name: 'Verträge', icon: FileText, color: 'bg-blue-50 text-blue-600', count: documents.filter(d => d.category === 'legal').length },
    { name: 'Lohnabrechnungen', icon: DollarSign, color: 'bg-green-50 text-green-600', count: documents.filter(d => d.category === 'payroll').length },
    { name: 'Krankmeldungen', icon: Heart, color: 'bg-red-50 text-red-600', count: documents.filter(d => d.tags.includes('krankmeldung')).length },
    { name: 'Weiterbildungsnachweise', icon: BookOpen, color: 'bg-orange-50 text-orange-600', count: documents.filter(d => d.category === 'training').length },
    { name: 'Urlaubsanträge', icon: Plane, color: 'bg-cyan-50 text-cyan-600', count: documents.filter(d => d.tags.includes('urlaub')).length },
    { name: 'Arbeitszeugnisse', icon: FileSignature, color: 'bg-purple-50 text-purple-600', count: documents.filter(d => d.category === 'recruiting').length },
    { name: 'Richtlinien', icon: BookOpen, color: 'bg-pink-50 text-pink-600', count: documents.filter(d => d.tags.includes('richtlinie')).length },
    { name: 'Datenschutz', icon: Shield, color: 'bg-indigo-50 text-indigo-600', count: documents.filter(d => d.tags.includes('datenschutz')).length },
  ];

  // Zuletzt aktualisiert
  const recentlyUsed = documents
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dokumente</h1>
          <p className="text-sm text-muted-foreground">Zentrale Verwaltung aller HR-Dokumente • DSGVO-konform • KI-gestützt</p>
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
          <Button variant="outline" size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Dokument hochladen
          </Button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/documents/new')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-xs">Vorschau</Badge>
            </div>
          </div>
          <div className="text-3xl font-bold">{recentDocuments}</div>
          <p className="text-sm text-muted-foreground mt-1">Neue Dokumente</p>
          <p className="text-xs text-muted-foreground">Letzte 7 Tage</p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/documents/approvals')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">{pendingApprovals}</div>
          <p className="text-sm text-muted-foreground mt-1">Offene Freigaben</p>
          <p className="text-xs text-muted-foreground">Benötigen Aktion</p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/documents/expiring')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">{expiringDocuments}</div>
          <p className="text-sm text-muted-foreground mt-1">Ablaufende Dokumente</p>
          <p className="text-xs text-muted-foreground">Nächste 30 Tage</p>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/documents/all')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold">{documents.length}</div>
          <p className="text-sm text-muted-foreground mt-1">Gesamt Dokumente</p>
          <p className="text-xs text-muted-foreground">Im System</p>
        </Card>
      </div>

      {/* Dokumentenkategorien */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dokumentenkategorien</h2>
        <div className="grid grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.name} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/documents/category/${category.name.toLowerCase()}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`h-10 w-10 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold">{category.count}</span>
              </div>
              <p className="text-sm font-medium">{category.name}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Zuletzt aktualisiert */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Zuletzt aktualisiert</h2>
        {recentlyUsed.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Dokumente vorhanden</p>
        ) : (
          <div className="space-y-3">
            {recentlyUsed.map((doc) => (
              <Card key={doc.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={async (file, category, metadata) => {
          await documentService.uploadDocument(file, {
            title: file.name,
            category: category as any,
            status: 'pending',
            requires_approval: true,
            employee_id: metadata?.employee_id,
            department: metadata?.department,
            document_type: metadata?.document_type
          });
        }}
      />

      <DocumentPreviewWithLinks
        document={selectedDocument}
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
      />
    </div>
  );
}
