
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud, File, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface TimeTrackingUploadProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimeTrackingUpload = ({
  employeeId,
  open,
  onOpenChange
}: TimeTrackingUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie eine Datei aus.",
      });
      return;
    }

    setUploading(true);

    try {
      // Simuliere Upload-Vorgang
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Upload erfolgreich",
        description: `Die Datei ${file.name} wurde erfolgreich hochgeladen.`,
      });
      
      // Nach erfolgreichem Upload Dialog schließen und Zeitdaten aktualisieren
      onOpenChange(false);
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['timeEntries', employeeId] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload fehlgeschlagen",
        description: "Die Datei konnte nicht hochgeladen werden.",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Zeiterfassungsdaten importieren</DialogTitle>
          <DialogDescription>
            Laden Sie eine CSV- oder Excel-Datei mit Zeiterfassungsdaten hoch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              file ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <UploadCloud className="h-10 w-10 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Drag & Drop Ihre Datei hier oder klicken Sie zum Auswählen
                  </p>
                  <p className="text-xs text-gray-400">
                    Unterstützte Formate: CSV, XLSX
                  </p>
                </div>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="mt-2" type="button">
                    Datei auswählen
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Formathinweis</Label>
            <p className="text-sm text-gray-500">
              Die Datei sollte folgende Spalten enthalten: Datum, Startzeit, Endzeit, Pause, 
              Projekt und Standort. Stellen Sie sicher, dass die Zeitangaben im Format 
              HH:MM vorliegen.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? "Wird hochgeladen..." : "Hochladen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
