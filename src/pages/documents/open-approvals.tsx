import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '@/types/documents';
import { DocumentPreviewWithLinks } from '@/components/documents/DocumentPreviewWithLinks';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function OpenApprovalsPage() {
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
  });

  // Filter nach offenen Freigaben
  const pendingApprovals = documents
    .filter(doc => doc.status === 'pending')
    .filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  const handleDocumentClick = (doc: Document) => {
    navigate(`/documents/detail/${doc.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold">Dokumente</h1>
            <p className="text-sm text-muted-foreground">
              Zentrale Verwaltung aller HR-Dokumente • DSGVO-konform • KI-gestützt
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Back Button & Title */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/documents')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Offene Freigaben</h2>
              <p className="text-sm text-muted-foreground">
                Dokumente, die Ihre Freigabe benötigen
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="p-6 mb-6 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{pendingApprovals.length}</p>
                <p className="text-sm text-muted-foreground">Dokumente gefunden</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
              <AlertCircle className="h-3 w-3 mr-1" />
              Aktion erforderlich
            </Badge>
          </div>
        </Card>

        {/* Search & Sort */}
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Dokumente durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="oldest">Älteste zuerst</SelectItem>
              <SelectItem value="name">Nach Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600">Keine offenen Freigaben gefunden</p>
            </Card>
          ) : (
            pendingApprovals.map((doc) => (
              <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg mb-1">{doc.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mitarbeiter-Dokument</span>
                        <span>•</span>
                        <span>{doc.document_type || 'Urlaubsantrag'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    Zur Freigabe
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Erstellt am</p>
                    <p className="text-sm font-medium">
                      📅 {new Date(doc.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Abteilung</p>
                    <p className="text-sm font-medium">{doc.department || 'Sales'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Version</p>
                    <p className="text-sm font-medium">v{doc.version}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Wartet auf Ihre Freigabe
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    Details
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    Freigeben
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
