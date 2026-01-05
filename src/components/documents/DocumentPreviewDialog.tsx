import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import type { Document } from '@/types/documents';
import { documentService } from '@/services/documentService';
import { DocumentApprovalActions } from './DocumentApprovalActions';
import { formatFileSize } from '@/utils/documentUtils';

interface DocumentPreviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({
  document,
  open,
  onOpenChange
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!document) return;

    setIsDownloading(true);
    try {
      console.log('Download document:', document.id);
      const result = await documentService.getDownloadUrl(document.file_path, document.id);
      
      if (result.data?.signedUrl) {
        // Erstelle einen Link zum Download
        const link = window.document.createElement('a');
        link.href = result.data.signedUrl;
        link.download = document.file_name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        toast.success('Download gestartet');
      } else {
        throw new Error('Download URL konnte nicht erstellt werden');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download fehlgeschlagen');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (!document) return;

    try {
      const result = await documentService.getDownloadUrl(document.file_path, document.id);
      
      if (result.data?.signedUrl) {
        // Für Bilder und PDFs zeigen wir eine Vorschau
        if (document.mime_type?.startsWith('image/') || document.mime_type === 'application/pdf') {
          setPreviewUrl(result.data.signedUrl);
        } else {
          // Für andere Dateitypen öffnen wir sie in einem neuen Tab
          window.open(result.data.signedUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Vorschau konnte nicht geladen werden');
    }
  };

  const renderPreview = () => {
    if (!document || !previewUrl) return null;

    if (document.mime_type?.startsWith('image/')) {
      return (
        <div className="mt-4">
          <img 
            src={previewUrl} 
            alt={document.title}
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (document.mime_type === 'application/pdf') {
      return (
        <div className="mt-4">
          <iframe
            src={previewUrl}
            className="w-full h-96 border rounded-lg"
            title={document.title}
          />
        </div>
      );
    }

    return null;
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-lg">{document.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {document.description || 'Keine Beschreibung verfügbar'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Dateiinformationen</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Dateiname:</strong> {document.file_name}</div>
                <div><strong>Größe:</strong> {formatFileSize(document.file_size)}</div>
                <div><strong>Typ:</strong> {document.mime_type}</div>
                <div><strong>Kategorie:</strong> {document.category}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status & Genehmigung</h4>
              <div className="space-y-2">
                <DocumentApprovalActions 
                  document={document} 
                  showActions={true}
                />
                <div className="text-sm">
                  <div><strong>Erstellt:</strong> {new Date(document.created_at).toLocaleDateString('de-DE')}</div>
                  <div><strong>Geändert:</strong> {new Date(document.updated_at).toLocaleDateString('de-DE')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Vorschau anzeigen
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Wird heruntergeladen...' : 'Herunterladen'}
            </Button>
          </div>

          {/* Preview Content */}
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};