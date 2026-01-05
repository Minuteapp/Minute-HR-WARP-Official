import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, AlertCircle, FileText, Calendar, User, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '@/types/documents';
import { differenceInDays, format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ExpiringDocumentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
  });

  // Filter nach ablaufenden Dokumenten (nächste 30 Tage)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiringDocuments = documents
    .filter(doc => {
      if (!doc.expiry_date) return false;
      const expiryDate = new Date(doc.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
    })
    .filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'soonest') {
        return new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime();
      } else {
        return new Date(b.expiry_date!).getTime() - new Date(a.expiry_date!).getTime();
      }
    });

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.status === 'approved') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">Freigegeben</Badge>;
    }
    if (doc.signature_status === 'signed') {
      return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Signiert</Badge>;
    }
    return null;
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dokumente</h1>
          <p className="text-sm text-muted-foreground">
            Zentrale Verwaltung aller HR-Dokumente • DSGVO-konform • KI-gestützt
          </p>
        </div>

        {/* Zurück Button & Title Section */}
        <div className="flex items-start gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/documents')}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Ablaufende Dokumente</h2>
              <p className="text-sm text-muted-foreground">
                Dokumente, die in den nächsten 30 Tagen ablaufen
              </p>
            </div>
          </div>
        </div>

        {/* Statistik Card */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div>
              <div className="text-3xl font-bold text-foreground">{expiringDocuments.length}</div>
              <p className="text-sm text-muted-foreground">Dokumente gefunden</p>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Dokumente durchsuchen..." 
              className="pl-9 bg-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="oldest">Älteste zuerst</SelectItem>
              <SelectItem value="soonest">Bald ablaufend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : expiringDocuments.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine ablaufenden Dokumente</h3>
              <p className="text-sm text-muted-foreground">
                Alle Dokumente sind aktuell oder haben kein Ablaufdatum.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {expiringDocuments.map((doc) => {
              const daysLeft = getDaysUntilExpiry(doc.expiry_date!);
              const isSelected = selectedDocuments.includes(doc.id);
              
              return (
                <Card 
                  key={doc.id} 
                  className={`p-6 transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground mb-1">{doc.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <User className="h-3 w-3" />
                          <span>{doc.created_by || 'Sarah Schmidt'}</span>
                          <span>•</span>
                          <span>{doc.document_type || 'Richtlinie'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc)}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Erstellt am</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(doc.created_at), 'dd.MM.yyyy', { locale: de })}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Läuft ab</p>
                      <div className="flex items-center gap-1 text-sm text-red-600 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        <span>{format(new Date(doc.expiry_date!), 'dd.MM.yyyy', { locale: de })} ({daysLeft} Tage)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Abteilung</p>
                      <p className="text-sm">{doc.department || 'HR'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Version</p>
                      <p className="text-sm">v{doc.version_number || doc.version}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleDocumentSelection(doc.id);
                      }}
                    >
                      Details anzeigen
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        {expiringDocuments.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedDocuments.length > 0 
                ? `${selectedDocuments.length} Dokumente ausgewählt` 
                : `${expiringDocuments.length} Dokumente ausgewählt`}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Teilen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
