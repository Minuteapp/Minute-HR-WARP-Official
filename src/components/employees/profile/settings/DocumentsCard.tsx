
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Shield, Upload, Download, Archive } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface DocumentsCardProps {
  employeeId: string;
}

export const DocumentsCard = ({ employeeId }: DocumentsCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ['employee_documents', employeeId, showArchived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('archived', showArchived)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_documents', employeeId] });
      toast.success("Dokument erfolgreich gelöscht");
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error("Fehler beim Löschen des Dokuments");
    }
  });

  const archiveDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .update({ archived: true })
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_documents', employeeId] });
      toast.success("Dokument erfolgreich archiviert");
    },
    onError: (error) => {
      console.error('Error archiving document:', error);
      toast.error("Fehler beim Archivieren des Dokuments");
    }
  });

  const handleDeleteDocument = async () => {
    if (!selectedDocumentId) return;
    deleteDocumentMutation.mutate(selectedDocumentId);
  };

  const handleArchiveDocument = async (documentId: string) => {
    archiveDocumentMutation.mutate(documentId);
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Dokumente
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "Aktive anzeigen" : "Archivierte anzeigen"}
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Hochladen
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {documents?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{doc.filename}</p>
                  <p className="text-sm text-gray-500">
                    Hochgeladen am {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{doc.document_type || 'Other'}</Badge>
                  {!doc.archived && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleArchiveDocument(doc.id)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie dieses Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
