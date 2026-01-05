import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, User, Hash, Building } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

const DocumentViewDialog: React.FC<DocumentViewDialogProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const { toast } = useToast();

  if (!document) return null;

  // Handle document download
  const handleDownload = async () => {
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

  // Check if document is expired or expiring soon
  const isExpired = document.expiry_date && new Date(document.expiry_date) < new Date();
  const isExpiringSoon = document.expiry_date && 
    new Date(document.expiry_date) > new Date() && 
    Math.ceil((new Date(document.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dokument anzeigen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">{document.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                {document.employee_document_types && (
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(document.employee_document_types.category)}`}>
                    {document.employee_document_types.name}
                  </div>
                )}
                <Badge variant={getStatusVariant(document.status)}>
                  {document.status === 'active' && 'Aktiv'}
                  {document.status === 'expired' && 'Abgelaufen'}
                  {document.status === 'pending' && 'Ausstehend'}
                  {document.status === 'archived' && 'Archiviert'}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Abgelaufen
                  </Badge>
                )}
                {isExpiringSoon && !isExpired && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    Läuft bald ab
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Herunterladen
            </Button>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground border-b border-border pb-2">
                Grundinformationen
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dateiname</p>
                    <p className="font-medium">{document.file_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {(document.file_size / 1024 / 1024).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dateigröße</p>
                    <p className="font-medium">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                {document.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Beschreibung</p>
                    <p className="text-sm">{document.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Metadata */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground border-b border-border pb-2">
                Dokumentdetails
              </h4>
              
              <div className="space-y-3">
                {document.document_number && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dokumentnummer</p>
                      <p className="font-medium">{document.document_number}</p>
                    </div>
                  </div>
                )}

                {document.issued_by && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ausgestellt von</p>
                      <p className="font-medium">{document.issued_by}</p>
                    </div>
                  </div>
                )}

                {document.issue_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ausstellungsdatum</p>
                      <p className="font-medium">
                        {format(new Date(document.issue_date), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                )}

                {document.expiry_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ablaufdatum</p>
                      <p className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : ''}`}>
                        {format(new Date(document.expiry_date), 'dd.MM.yyyy', { locale: de })}
                        {isExpired && ' (Abgelaufen)'}
                        {isExpiringSoon && !isExpired && ' (Läuft bald ab)'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Upload-Informationen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Hochgeladen am</p>
                <p className="font-medium">
                  {format(new Date(document.created_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                </p>
              </div>
              {document.updated_at !== document.created_at && (
                <div>
                  <p className="text-muted-foreground">Zuletzt aktualisiert</p>
                  <p className="font-medium">
                    {format(new Date(document.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Preview (if PDF) */}
          {document.mime_type === 'application/pdf' && (
            <div className="border border-border rounded-lg p-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                PDF-Vorschau ist nicht verfügbar. Laden Sie die Datei herunter, um sie anzuzeigen.
              </p>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                PDF herunterladen
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewDialog;