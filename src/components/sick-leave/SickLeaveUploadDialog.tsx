
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SickLeave } from "@/types/sick-leave";
import { format } from "date-fns";
import { Upload, File, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SickLeaveUploadDialogProps {
  sickLeave: SickLeave;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SickLeaveUploadDialog = ({ sickLeave, isOpen, onClose, onSuccess }: SickLeaveUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...fileList]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie mindestens eine Datei aus."
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simulieren eines Uploads
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Erfolg simulieren
      toast({
        title: "Erfolg",
        description: "Dokumente wurden erfolgreich hochgeladen."
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Hochladen ist ein Fehler aufgetreten."
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dokumente hochladen</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Krankmeldung für den Zeitraum vom {format(new Date(sickLeave.start_date), 'dd.MM.yyyy')} 
              {sickLeave.end_date && ` bis ${format(new Date(sickLeave.end_date), 'dd.MM.yyyy')}`}
            </p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Klicken Sie hier, um Dateien auszuwählen
              </p>
              <p className="text-xs text-gray-400">
                Unterstützte Formate: PDF, JPG, PNG
              </p>
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Ausgewählte Dateien:</p>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm truncate max-w-[180px]">{file.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || files.length === 0}>
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wird hochgeladen...
              </>
            ) : (
              'Hochladen'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SickLeaveUploadDialog;
