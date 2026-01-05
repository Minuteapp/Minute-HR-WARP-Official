import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trash2, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DocumentTrashPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEmptyDialog, setShowEmptyDialog] = useState(false);

  const { data: deletedDocuments = [], isLoading } = useQuery({
    queryKey: ['deleted-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleRestore = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ deleted_at: null })
        .eq('id', documentId);

      if (error) throw error;
      
      toast.success('Dokument wiederhergestellt');
      queryClient.invalidateQueries({ queryKey: ['deleted-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Wiederherstellen fehlgeschlagen');
    }
  };

  const handlePermanentDelete = async (documentId: string, filePath?: string) => {
    if (!confirm('Dokument endgültig löschen? Dies kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      // Datei aus Storage löschen
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }

      // DB-Eintrag löschen
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      toast.success('Dokument endgültig gelöscht');
      queryClient.invalidateQueries({ queryKey: ['deleted-documents'] });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Löschen fehlgeschlagen');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      // Alle Dateien aus Storage löschen
      const filePaths = deletedDocuments
        .filter((doc: any) => doc.file_path)
        .map((doc: any) => doc.file_path);

      if (filePaths.length > 0) {
        await supabase.storage.from('documents').remove(filePaths);
      }

      // Alle DB-Einträge löschen
      const { error } = await supabase
        .from('documents')
        .delete()
        .not('deleted_at', 'is', null);

      if (error) throw error;
      
      toast.success('Papierkorb geleert');
      setShowEmptyDialog(false);
      queryClient.invalidateQueries({ queryKey: ['deleted-documents'] });
    } catch (error) {
      console.error('Empty trash error:', error);
      toast.error('Papierkorb leeren fehlgeschlagen');
    }
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
              <Trash2 className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">Papierkorb</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {deletedDocuments.length} gelöschte Dokumente
            </p>
          </div>
        </div>

        {deletedDocuments.length > 0 && (
          <Button 
            variant="destructive"
            onClick={() => setShowEmptyDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Papierkorb leeren
          </Button>
        )}
      </div>

      {/* Dokumentenliste */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : deletedDocuments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Papierkorb ist leer</h3>
            <p className="text-sm text-muted-foreground">
              Gelöschte Dokumente werden hier angezeigt.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {deletedDocuments.map((doc: any) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title || doc.file_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Gelöscht: {format(new Date(doc.deleted_at), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                      <span>•</span>
                      <span>Kategorie: {doc.category || 'Keine'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(doc.id)}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Wiederherstellen
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePermanentDelete(doc.id, doc.file_path)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Endgültig löschen
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty Trash Dialog */}
      <AlertDialog open={showEmptyDialog} onOpenChange={setShowEmptyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Papierkorb leeren
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich alle {deletedDocuments.length} Dokumente endgültig löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
