import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AbsenceDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

interface AbsenceDocumentUploadProps {
  absenceRequestId: string;
  documents: AbsenceDocument[];
  onUploadComplete: () => void;
}

export const AbsenceDocumentUpload: React.FC<AbsenceDocumentUploadProps> = ({
  absenceRequestId,
  documents,
  onUploadComplete
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validierung
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Datei zu groß. Maximale Größe: 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nur JPG, PNG und PDF Dateien erlaubt');
      return;
    }

    setUploading(true);

    try {
      // Datei hochladen zu Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${absenceRequestId}_${Date.now()}.${fileExt}`;
      const filePath = `absence-documents/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Hole company_id für den Eintrag
      const { data: request } = await supabase
        .from('absence_requests')
        .select('company_id')
        .eq('id', absenceRequestId)
        .single();

      // Dokument-Eintrag in DB erstellen
      const { error: dbError } = await supabase
        .from('absence_documents')
        .insert({
          absence_request_id: absenceRequestId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          company_id: request?.company_id || ''
        });

      if (dbError) throw dbError;

      toast.success('Dokument erfolgreich hochgeladen');
      onUploadComplete();
    } catch (error) {
      console.error('Upload-Fehler:', error);
      toast.error('Fehler beim Hochladen des Dokuments');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (document: AbsenceDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Download gestartet');
    } catch (error) {
      console.error('Download-Fehler:', error);
      toast.error('Fehler beim Download');
    }
  };

  const handleView = async (document: AbsenceDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Anzeige-Fehler:', error);
      toast.error('Fehler beim Öffnen des Dokuments');
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm('Dokument wirklich löschen?')) return;

    try {
      // Lösche aus Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Lösche aus DB
      const { error: dbError } = await supabase
        .from('absence_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Dokument gelöscht');
      onUploadComplete();
    } catch (error) {
      console.error('Lösch-Fehler:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div>
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              disabled={uploading}
              className="w-full cursor-pointer"
              asChild
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? 'Wird hochgeladen...' : 'Dokument hochladen'}
              </div>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-2">
            Erlaubt: JPG, PNG, PDF (max. 10MB)
          </p>
        </div>

        {/* Dokumentenliste */}
        {documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Noch keine Dokumente hochgeladen
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(doc)}
                    title="Anzeigen"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    title="Herunterladen"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.file_path)}
                    title="Löschen"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
