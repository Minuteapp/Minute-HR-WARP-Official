import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  file: File;
  path?: string;
  uploading?: boolean;
}

interface HRNoteAttachmentUploadProps {
  noteId?: string;
  onFilesChange?: (files: UploadedFile[]) => void;
}

export const HRNoteAttachmentUpload = ({ noteId, onFilesChange }: HRNoteAttachmentUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const maxSize = 10 * 1024 * 1024; // 10 MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
  ];

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Datei zu groß",
        description: `${file.name} überschreitet die maximale Dateigröße von 10 MB.`,
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Ungültiger Dateityp",
        description: `${file.name} hat einen nicht unterstützten Dateityp.`,
      });
      return false;
    }

    return true;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: UploadedFile[] = [];
    Array.from(newFiles).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push({ file });
      }
    });

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Dateien hierher ziehen oder klicken zum Auswählen
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          PDF, DOCX, XLSX, Bilder (max. 10 MB)
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button" variant="outline" size="sm" asChild>
            <span>Dateien auswählen</span>
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Hochgeladene Dateien ({files.length})</div>
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{uploadedFile.file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
