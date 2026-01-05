import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Link, Upload, CheckCircle, AlertCircle, 
  Calendar, User, Clock, Eye 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface AbsenceDocumentLinkProps {
  absenceRequestId: string;
  onClose: () => void;
}

export const AbsenceDocumentIntegration: React.FC<AbsenceDocumentLinkProps> = ({
  absenceRequestId,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Absence Request Details
  const { data: absenceRequest } = useQuery({
    queryKey: ['absence-request', absenceRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('id', absenceRequestId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Verfügbare Dokumente (relevant für Abwesenheitsantrag)
  const { data: availableDocuments = [], isLoading } = useQuery({
    queryKey: ['available-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .is('deleted_at', null)
        .in('category', ['employee', 'legal', 'company'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Bereits verknüpfte Dokumente
  const { data: linkedDocuments = [] } = useQuery({
    queryKey: ['linked-documents', absenceRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_documents')
        .select(`
          *,
          document:documents(*)
        `)
        .eq('absence_request_id', absenceRequestId);
      
      if (error) throw error;
      return data;
    }
  });

  // Link Document to Absence Request
  const linkMutation = useMutation({
    mutationFn: async (documentIds: string[]) => {
      const linkPromises = documentIds.map(documentId => 
        supabase.from('absence_documents').insert({
          absence_request_id: absenceRequestId,
          document_id: documentId,
          uploaded_at: new Date().toISOString()
        })
      );
      
      await Promise.all(linkPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-documents', absenceRequestId] });
      toast({ title: 'Dokumente erfolgreich verknüpft' });
      setSelectedDocuments([]);
    }
  });

  // Auto-Upload für Krankmeldungen
  const uploadSickLeaveDocument = async (file: File) => {
    try {
      // Upload zu Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${absenceRequestId}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Dokument in documents Tabelle erstellen
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: `Krankmeldung - ${absenceRequest?.employee_name}`,
          description: `Automatisch hochgeladenes Dokument für Abwesenheitsantrag`,
          category: 'employee',
          file_path: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending',
          module_source: 'absence_management'
        })
        .select()
        .single();

      if (documentError) throw documentError;

      // Automatisch verknüpfen
      await supabase.from('absence_documents').insert({
        absence_request_id: absenceRequestId,
        document_id: documentData.id,
        uploaded_at: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['linked-documents', absenceRequestId] });
      toast({ title: 'Krankmeldung erfolgreich hochgeladen und verknüpft' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload fehlgeschlagen',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadSickLeaveDocument(file);
    }
  };

  return (
    <Dialog open={!!absenceRequestId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Dokumente verknüpfen</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Absence Request Info */}
          {absenceRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Abwesenheitsantrag Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{absenceRequest.employee_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{absenceRequest.start_date} - {absenceRequest.end_date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{absenceRequest.type}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Badge variant={absenceRequest.status === 'pending' ? 'secondary' : 'default'}>
                      {absenceRequest.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Upload für Krankmeldungen */}
          {absenceRequest?.type === 'sick_leave' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">
                  Krankmeldung hochladen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <label htmlFor="sick-leave-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Ärztliches Attest hochladen
                      <input
                        id="sick-leave-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                  <span className="text-sm text-blue-700">
                    PDF, JPG oder PNG (max. 10 MB)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bereits verknüpfte Dokumente */}
          {linkedDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verknüpfte Dokumente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {linkedDocuments.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{link.document?.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {link.document?.file_name} • {(link.document?.file_size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verknüpft
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verfügbare Dokumente zum Verknüpfen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verfügbare Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {availableDocuments
                    .filter(doc => !linkedDocuments.some(link => link.document?.id === doc.id))
                    .map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(prev => [...prev, document.id]);
                            } else {
                              setSelectedDocuments(prev => prev.filter(id => id !== document.id));
                            }
                          }}
                          className="rounded"
                        />
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{document.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {document.category} • {document.file_name}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{document.status}</Badge>
                    </div>
                  ))}
                  
                  {availableDocuments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      Keine Dokumente verfügbar
                    </div>
                  )}
                </div>
              )}
              
              {selectedDocuments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => linkMutation.mutate(selectedDocuments)}
                    disabled={linkMutation.isPending}
                    className="w-full"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    {selectedDocuments.length} Dokument(e) verknüpfen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};