import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Camera, FileText, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExpenseUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
  businessTripId?: string;
}

export function ExpenseUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  businessTripId,
}: ExpenseUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Generate expense number
      const expenseNumber = `EXP-${Date.now().toString(36).toUpperCase()}`;
      
      // Upload file to storage (if bucket exists)
      const filePath = `expenses/${expenseNumber}/${selectedFile.name}`;
      
      // Create expense record with pending AI status
      const { error } = await supabase.from("business_trip_expenses").insert({
        business_trip_id: businessTripId || null,
        description: selectedFile.name.replace(/\.[^/.]+$/, ""),
        category: "Sonstiges",
        amount: 0,
        currency: "EUR",
        expense_date: new Date().toISOString().split('T')[0],
        receipt_file_name: selectedFile.name,
        receipt_path: filePath,
        expense_number: expenseNumber,
        file_size_kb: Math.round(selectedFile.size / 1024),
        ai_status: 'pending',
        ai_confidence: 0,
      });

      if (error) throw error;

      // Add history entry
      await supabase.from("expense_history").insert({
        action: "Beleg hochgeladen",
        actor_name: "System",
        actor_type: "system",
        details: { file_name: selectedFile.name, file_size: selectedFile.size },
      });

      toast.success("Beleg erfolgreich hochgeladen");
      setSelectedFile(null);
      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen des Belegs");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beleg hochladen</DialogTitle>
          <DialogDescription>
            Laden Sie Ihren Beleg hoch. Die KI erkennt automatisch alle relevanten Daten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${isDragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Datei hier ablegen..."
                    : "Datei hierher ziehen oder klicken zum Auswählen"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, JPG, PNG bis 10MB
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Datei auswählen
                </Button>
                <Button variant="outline" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Foto aufnehmen
                </Button>
              </div>
            </>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Abbrechen
            </Button>
            {selectedFile && (
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Wird hochgeladen..." : "Hochladen"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
