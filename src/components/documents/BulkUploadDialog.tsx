import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

interface BulkUploadDialogProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

const BulkUploadDialog = ({ onClose, onUploadComplete }: BulkUploadDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [defaultCategory, setDefaultCategory] = useState("other");
  const [defaultVisibility, setDefaultVisibility] = useState("private");
  const [overallProgress, setOverallProgress] = useState(0);

  const categories = [
    { value: "contract", label: "Verträge" },
    { value: "certificate", label: "Zertifikate" },
    { value: "training", label: "Schulungen" },
    { value: "identification", label: "Ausweise" },
    { value: "policy", label: "Richtlinien" },
    { value: "payroll", label: "Lohn & Gehalt" },
    { value: "visa", label: "Visa" },
    { value: "permit", label: "Genehmigungen" },
    { value: "onboarding", label: "Onboarding" },
    { value: "compliance", label: "Compliance" },
    { value: "template", label: "Vorlagen" },
    { value: "other", label: "Sonstiges" }
  ];

  const allowedTypes = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'text/plain': 'txt'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const processFiles = (selectedFiles: File[]) => {
    const validFiles: FileUploadStatus[] = [];
    const errors: string[] = [];

    selectedFiles.forEach((file) => {
      // Validiere Dateityp
      if (!Object.keys(allowedTypes).includes(file.type)) {
        errors.push(`${file.name}: Ungültiger Dateityp`);
        return;
      }

      // Validiere Dateigröße (50MB Max)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name}: Datei zu groß (max. 50MB)`);
        return;
      }

      // Prüfe auf Duplikate
      if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
        errors.push(`${file.name}: Datei bereits hinzugefügt`);
        return;
      }

      validFiles.push({
        file,
        status: 'pending',
        progress: 0
      });
    });

    if (errors.length > 0) {
      toast({
        title: "Einige Dateien konnten nicht hinzugefügt werden",
        description: errors.slice(0, 3).join(", ") + (errors.length > 3 ? "..." : ""),
        variant: "destructive",
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileStatus: FileUploadStatus, index: number): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Update status to uploading
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const file = fileStatus.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        // Update progress to 30%
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress: 30 } : f
        ));

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Update progress to 60%
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress: 60 } : f
        ));

        // Create database entry
        const { data: documentData, error: dbError } = await supabase
          .from('documents')
          .insert({
            title: file.name.split('.').slice(0, -1).join('.'),
            category: defaultCategory,
            file_name: file.name,
            file_path: filePath,
            file_type: allowedTypes[file.type as keyof typeof allowedTypes],
            file_size: file.size,
            mime_type: file.type,
            visibility_level: defaultVisibility,
            status: 'draft'
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Update progress to 90%
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress: 90, documentId: documentData.id } : f
        ));

        // Add to AI processing queue
        await supabase.from('document_ai_queue').insert([
          {
            document_id: documentData.id,
            task_type: 'ocr',
            status: 'pending'
          },
          {
            document_id: documentData.id,
            task_type: 'categorization',
            status: 'pending'
          }
        ]);

        // Update to success
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'success', progress: 100 } : f
        ));

        resolve();

      } catch (error: any) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'error', 
            error: error.message || 'Upload fehlgeschlagen' 
          } : f
        ));
        reject(error);
      }
    });
  };

  const startBulkUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Keine Dateien ausgewählt",
        description: "Bitte wählen Sie mindestens eine Datei zum Hochladen aus",
        variant: "destructive",
      });
      return;
    }

    if (!sessionName.trim()) {
      toast({
        title: "Session-Name erforderlich",
        description: "Bitte geben Sie einen Namen für diese Upload-Session ein",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);

    try {
      // Create bulk upload session
      const { data: sessionData, error: sessionError } = await supabase
        .from('bulk_upload_sessions')
        .insert({
          session_name: sessionName,
          total_files: files.length,
          status: 'processing'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      let completedFiles = 0;
      const errors: string[] = [];

      // Upload files sequentially to avoid overwhelming the system
      for (let i = 0; i < files.length; i++) {
        try {
          await uploadFile(files[i], i);
          completedFiles++;
        } catch (error: any) {
          errors.push(`${files[i].file.name}: ${error.message}`);
        }

        // Update overall progress
        setOverallProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Update session
      await supabase
        .from('bulk_upload_sessions')
        .update({
          processed_files: completedFiles,
          failed_files: files.length - completedFiles,
          status: 'completed',
          error_log: errors
        })
        .eq('id', sessionData.id);

      if (errors.length === 0) {
        toast({
          title: "Upload erfolgreich",
          description: `Alle ${files.length} Dateien wurden erfolgreich hochgeladen`,
        });
      } else {
        toast({
          title: "Upload teilweise erfolgreich",
          description: `${completedFiles} von ${files.length} Dateien hochgeladen. ${errors.length} Fehler.`,
          variant: "destructive",
        });
      }

      onUploadComplete();

    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Bulk-Upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Konfiguration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sessionName">Session-Name *</Label>
          <Input
            id="sessionName"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="z.B. Verträge Q1 2024"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label>Standard-Kategorie</Label>
          <Select value={defaultCategory} onValueChange={setDefaultCategory} disabled={isUploading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Standard-Sichtbarkeit</Label>
          <Select value={defaultVisibility} onValueChange={setDefaultVisibility} disabled={isUploading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Privat</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="department">Abteilung</SelectItem>
              <SelectItem value="company">Unternehmen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Datei-Upload Bereich */}
      {!isUploading && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Mehrere Dateien hier ablegen oder klicken zum Auswählen
          </p>
          <p className="text-sm text-gray-500">
            PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT (max. 50MB pro Datei)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Overall Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Upload-Fortschritt</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} />
          <div className="text-xs text-gray-500 text-center">
            {successCount} erfolgreich • {errorCount} Fehler • {pendingCount} ausstehend
          </div>
        </div>
      )}

      {/* Datei-Liste */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Ausgewählte Dateien ({files.length})</h3>
            {!isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
              >
                Alle entfernen
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {files.map((fileStatus, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIcon(fileStatus.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileStatus.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileStatus.file.size)}
                      </p>
                      {fileStatus.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {fileStatus.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {fileStatus.status === 'uploading' && (
                      <div className="w-16">
                        <Progress value={fileStatus.progress} className="h-2" />
                      </div>
                    )}
                    
                    <Badge
                      variant={
                        fileStatus.status === 'success' ? 'default' :
                        fileStatus.status === 'error' ? 'destructive' :
                        fileStatus.status === 'uploading' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {fileStatus.status === 'pending' && 'Wartend'}
                      {fileStatus.status === 'uploading' && 'Upload...'}
                      {fileStatus.status === 'success' && 'Erfolg'}
                      {fileStatus.status === 'error' && 'Fehler'}
                    </Badge>

                    {!isUploading && fileStatus.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onClose} 
          disabled={isUploading}
        >
          {isUploading ? "Upload läuft..." : "Abbrechen"}
        </Button>
        <Button 
          onClick={startBulkUpload}
          disabled={isUploading || files.length === 0 || !sessionName.trim()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird hochgeladen...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {files.length} Dateien hochladen
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkUploadDialog;