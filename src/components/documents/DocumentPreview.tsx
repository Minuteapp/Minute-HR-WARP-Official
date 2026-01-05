import { useState, useEffect } from "react";
import { X, Download, Share2, Edit, FileText, Image, File, Clock, CheckCircle, AlertCircle, Archive, Signature, Tag, Calendar, User, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { Document } from "@/types/documents";

interface DocumentPreviewProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (document: Document) => void;
}

const DocumentPreview = ({ document, isOpen, onClose, onUpdate }: DocumentPreviewProps) => {
  const { toast } = useToast();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && document) {
      loadFileUrl();
      loadComments();
      loadDownloadHistory();
      loadVersions();
    }
  }, [isOpen, document]);

  const loadFileUrl = async () => {
    if (!document) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 Stunde gültig

      if (error) throw error;
      setFileUrl(data.signedUrl);
    } catch (error: any) {
      console.error('Fehler beim Laden der Datei-URL:', error);
      toast({
        title: "Vorschau nicht verfügbar",
        description: "Die Datei konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!document) return;
    
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', document.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Kommentare:', error);
    }
  };

  const loadDownloadHistory = async () => {
    if (!document) return;
    
    try {
      const { data, error } = await supabase
        .from('document_downloads')
        .select('*')
        .eq('document_id', document.id)
        .order('downloaded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDownloadHistory(data || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Download-Historie:', error);
    }
  };

  const loadVersions = async () => {
    if (!document) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`id.eq.${document.id},parent_document_id.eq.${document.id}`)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Versionen:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="h-6 w-6 text-blue-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-6 w-6 text-green-600" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      contract: 'Vertrag',
      certificate: 'Zertifikat',
      training: 'Schulung',
      identification: 'Ausweis',
      policy: 'Richtlinie',
      payroll: 'Lohn & Gehalt',
      visa: 'Visa',
      permit: 'Genehmigung',
      onboarding: 'Onboarding',
      compliance: 'Compliance',
      template: 'Vorlage',
      other: 'Sonstiges'
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      // Download-Log erstellen
      await supabase.from('document_downloads').insert({
        document_id: document.id,
        download_method: 'direct'
      });

      // Datei herunterladen
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Download starten
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download gestartet",
        description: "Die Datei wird heruntergeladen",
      });

      // Download-Historie aktualisieren
      loadDownloadHistory();

    } catch (error: any) {
      console.error('Download-Fehler:', error);
      toast({
        title: "Download fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Download",
        variant: "destructive",
      });
    }
  };

  const renderFilePreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Vorschau wird geladen...</p>
          </div>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Vorschau nicht verfügbar</p>
          </div>
        </div>
      );
    }

    if (!document) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Kein Dokument ausgewählt</p>
          </div>
        </div>
      );
    }

    switch (document.file_type) {
      case 'pdf':
        return (
          <div className="w-full h-96">
            <iframe
              src={fileUrl}
              className="w-full h-full border rounded-lg"
              title={document.title}
            />
          </div>
        );
      
      case 'png':
      case 'jpg':
      case 'jpeg':
        return (
          <div className="flex justify-center">
            <img
              src={fileUrl}
              alt={document.title}
              className="max-h-96 max-w-full object-contain rounded-lg"
            />
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              {getFileIcon(document.file_type)}
              <p className="text-sm text-gray-600 mt-2">
                Vorschau für {document.file_type.toUpperCase()} nicht verfügbar
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="mt-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Datei herunterladen
              </Button>
            </div>
          </div>
        );
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(document.file_type)}
              <div>
                <DialogTitle className="text-xl">{document.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {getCategoryLabel(document.category)} • {formatFileSize(document.file_size)} • Version {document.version_number}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Teilen
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="preview">Vorschau</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="versions">Versionen</TabsTrigger>
                <TabsTrigger value="activity">Aktivität</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="flex-1 px-6 pb-6">
              <div className="h-full">
                {renderFilePreview()}
              </div>
            </TabsContent>

            <TabsContent value="details" className="flex-1 px-6 pb-6">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Grundinformationen */}
                  <div>
                    <h3 className="font-medium mb-3">Grundinformationen</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center mt-1">
                          {getStatusIcon(document.status)}
                          <span className="ml-2 capitalize">{document.status}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kategorie:</span>
                        <p className="mt-1">{getCategoryLabel(document.category)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Erstellt:</span>
                        <p className="mt-1">{formatDate(document.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aktualisiert:</span>
                        <p className="mt-1">{formatDate(document.updated_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sichtbarkeit:</span>
                        <p className="mt-1 capitalize">{document.visibility_level}</p>
                      </div>
                      {document.expiry_date && (
                        <div>
                          <span className="text-muted-foreground">Ablaufdatum:</span>
                          <p className="mt-1">{formatDate(document.expiry_date)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Beschreibung */}
                  {document.description && (
                    <div>
                      <h3 className="font-medium mb-3">Beschreibung</h3>
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {document.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signatur-Informationen */}
                  {document.requires_signature && (
                    <div>
                      <h3 className="font-medium mb-3">Elektronische Signatur</h3>
                      <div className="flex items-center space-x-2">
                        <Signature className="h-4 w-4" />
                        <span className="text-sm">Status: {document.signature_status}</span>
                      </div>
                    </div>
                  )}

                   {/* OCR-Inhalt würde hier angezeigt werden, falls verfügbar */}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="versions" className="flex-1 px-6 pb-6">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Version {version.version_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(version.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {version.is_current_version && (
                            <Badge variant="default">Aktuell</Badge>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ansehen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 px-6 pb-6">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="font-medium">Download-Historie</h3>
                  <div className="space-y-2">
                    {downloadHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Noch keine Downloads</p>
                    ) : (
                      downloadHistory.map((download) => (
                        <div key={download.id} className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center space-x-2">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Heruntergeladen am {formatDate(download.downloaded_at)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {download.download_method}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {comments.length > 0 && (
                    <>
                      <Separator />
                      <h3 className="font-medium">Kommentare</h3>
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">Benutzer</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreview;