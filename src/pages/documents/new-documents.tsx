import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Eye, FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '@/types/documents';
import { DocumentPreviewWithLinks } from '@/components/documents/DocumentPreviewWithLinks';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function NewDocumentsPage() {
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
  });

  // Filter nach den letzten 7 Tagen
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newDocuments = documents
    .filter(doc => new Date(doc.created_at) >= sevenDaysAgo)
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
    setSelectedDocument(doc);
    setShowPreviewDialog(true);
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
            <div className="bg-blue-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Neue Dokumente</h2>
              <p className="text-sm text-muted-foreground">
                Dokumente der letzten 7 Tage
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="p-6 mb-6 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">{newDocuments.length}</p>
              <p className="text-sm text-muted-foreground">Dokumente gefunden</p>
            </div>
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
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : newDocuments.length === 0 ? (
            <Card className="p-16 text-center bg-white">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-50 p-6 rounded-full">
                  <TrendingUp className="h-16 w-16 text-blue-400" />
                </div>
              </div>
              <p className="text-lg font-semibold mb-2">Keine neuen Dokumente in den letzten 7 Tagen</p>
              <p className="text-sm text-muted-foreground">
                Überprüfen Sie später wieder.
              </p>
            </Card>
          ) : (
            newDocuments.map((doc) => (
              <Card 
                key={doc.id} 
                className="p-6 hover:shadow-md transition-shadow bg-white cursor-pointer"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: de })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {doc.category}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>

        <DocumentPreviewWithLinks
          document={selectedDocument}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
        />
      </div>
    </div>
  );
}
