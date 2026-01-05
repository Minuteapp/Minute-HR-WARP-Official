import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Paperclip,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ExtendedTask } from '../hooks/useEnhancedTasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  filePath?: string;
}

interface TaskAttachmentsProps {
  task?: ExtendedTask | null;
}

export function TaskAttachments({ task }: TaskAttachmentsProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['task-attachments', task?.id],
    queryFn: async () => {
      if (!task?.id) return [];
      
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('task_attachments error:', error.message);
        return [];
      }
      
      return (data || []).map((att: any) => ({
        id: att.id,
        name: att.file_name || 'Unbekannt',
        type: att.file_type?.startsWith('image/') ? 'image' : 
              att.file_type?.includes('pdf') || att.file_type?.includes('document') ? 'document' : 'other',
        size: formatFileSize(att.file_size || 0),
        uploadedAt: att.created_at,
        uploadedBy: att.uploaded_by_name || 'Unbekannt',
        url: att.file_url,
        filePath: att.file_path
      })) as Attachment[];
    },
    enabled: !!task?.id
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      if (!task?.id) throw new Error('Keine Aufgabe ausgewählt');
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Nicht authentifiziert');

      // Get company_id from employee or profile
      const { data: employee } = await supabase
        .from('employees')
        .select('company_id, first_name, last_name')
        .eq('user_id', user.id)
        .single();

      const companyId = employee?.company_id;
      if (!companyId) throw new Error('Keine Firma zugeordnet');

      const uploaderName = employee ? `${employee.first_name} ${employee.last_name}` : user.email || 'Unbekannt';
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));

        // Upload to storage
        const filePath = `${task.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from('task_attachments')
          .insert({
            task_id: task.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            file_url: urlData.publicUrl,
            uploaded_by: user.id,
            uploaded_by_name: uploaderName,
            company_id: companyId
          });

        if (dbError) throw dbError;
        uploadedFiles.push(file.name);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      return uploadedFiles;
    },
    onSuccess: (files) => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', task?.id] });
      toast({
        title: 'Upload erfolgreich',
        description: `${files.length} Datei(en) hochgeladen`
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Upload fehlgeschlagen',
        description: error.message
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachment: Attachment) => {
      // Delete from storage
      if (attachment.filePath) {
        await supabase.storage
          .from('task-attachments')
          .remove([attachment.filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', task?.id] });
      toast({ title: 'Anhang gelöscht' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Löschen fehlgeschlagen',
        description: error.message
      });
    }
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      uploadMutation.mutate(files);
    }
    event.target.value = '';
  }, [uploadMutation]);

  const handleDownload = (attachment: Attachment) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  const handleDeleteAttachment = (attachment: Attachment) => {
    if (window.confirm('Anhang wirklich löschen?')) {
      deleteMutation.mutate(attachment);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-green-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!task) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Paperclip className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p>Keine Aufgabe ausgewählt</p>
        <p className="text-sm mt-1">Wählen Sie eine Aufgabe aus, um Anhänge zu verwalten.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Dateien hochladen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUploading ? (
            <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Dateien werden hochgeladen...
              </h3>
              <div className="max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Dateien hier ablegen oder hochladen
              </h3>
              <p className="text-gray-600 mb-4">
                Unterstützte Formate: PNG, JPG, PDF, DOC, DOCX, XLS, XLSX (max. 10MB)
              </p>
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <Button asChild disabled={isUploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Dateien auswählen
                </label>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-5 w-5" />
              <span>Anhänge</span>
            </div>
            <Badge variant="outline">
              {attachments.length} Datei{attachments.length !== 1 ? 'en' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Noch keine Anhänge vorhanden</p>
              <p className="text-sm text-muted-foreground mt-1">
                Laden Sie Dateien hoch, um sie mit dieser Aufgabe zu verknüpfen.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </h4>
                      <Badge variant="outline" className={getFileTypeColor(attachment.type)}>
                        {attachment.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>{attachment.size}</span>
                      <span>•</span>
                      <span>Hochgeladen von {attachment.uploadedBy}</span>
                      <span>•</span>
                      <span>{new Date(attachment.uploadedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => attachment.url && window.open(attachment.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteAttachment(attachment)}
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

      {/* Attachment Statistics */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {attachments.filter(a => a.type === 'image').length}
                </p>
                <p className="text-sm text-gray-600">Bilder</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {attachments.filter(a => a.type === 'document').length}
                </p>
                <p className="text-sm text-gray-600">Dokumente</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {attachments.filter(a => a.type === 'other').length}
                </p>
                <p className="text-sm text-gray-600">Andere</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
