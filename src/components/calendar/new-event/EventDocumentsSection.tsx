
import { useState, useRef } from "react";
import { Upload, FileX, FileText, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDocumentType } from "@/types/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFileSize } from "@/utils/documentUtils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventDocumentsSectionProps {
  documents: File[];
  documentTypes: EventDocumentType[];
  onAddDocuments: (files: File[]) => void;
  onRemoveDocument: (index: number) => void;
  onChangeDocumentType: (index: number, type: EventDocumentType) => void;
  isEditing?: boolean;
  className?: string;
}

export default function EventDocumentsSection({
  documents = [],
  documentTypes = [],
  onAddDocuments,
  onRemoveDocument,
  onChangeDocumentType,
  isEditing = true,
  className = ""
}: EventDocumentsSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Ungültiges Dateiformat",
          description: `${file.name} hat ein nicht unterstütztes Format. Erlaubt sind PDF, DOCX, XLSX, JPG und PNG.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Datei zu groß",
          description: `${file.name} ist größer als 10MB.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.dataTransfer.files));
      if (validFiles.length > 0) {
        onAddDocuments(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.target.files));
      if (validFiles.length > 0) {
        onAddDocuments(validFiles);
      }
      
      // Reset input so the same file can be uploaded again if needed
      if (e.target.value) e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (extension === 'docx') return <FileText className="h-5 w-5 text-blue-500" />;
    if (extension === 'xlsx') return <FileText className="h-5 w-5 text-green-500" />;
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) return <FileText className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-base font-medium">Dokumente anhängen</h3>
      
      {isEditing && (
        <div
          className={`border-2 border-dashed rounded-md p-6 transition-colors ${
            dragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, XLSX, JPG, PNG (max. 10MB)
            </p>
            <Button type="button" variant="outline" onClick={handleButtonClick}>
              Dateien auswählen
            </Button>
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Angehängte Dokumente</p>
          
          <div className="space-y-3">
            {documents.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <div className="flex-shrink-0">
                  {getFileIcon(file.name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={documentTypes[index] || 'other'} 
                      onValueChange={(value) => onChangeDocumentType(index, value as EventDocumentType)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Dokumenttyp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resume">Bewerberprofil</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                        <SelectItem value="contract">Vertrag</SelectItem>
                        <SelectItem value="presentation">Präsentation</SelectItem>
                        <SelectItem value="report">Bericht</SelectItem>
                        <SelectItem value="form">Formular</SelectItem>
                        <SelectItem value="other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => onRemoveDocument(index)}
                          >
                            <FileX className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Entfernen</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                
                {!isEditing && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Download className="h-4 w-4 mr-1" /> Herunterladen
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dokument herunterladen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ))}
          </div>
          
          {documents.some((_, index) => documentTypes[index] === 'resume' || documentTypes[index] === 'contract') && (
            <div className="flex items-center mt-2 p-2 bg-yellow-50 rounded-md text-xs text-amber-800 border border-amber-200">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>Dieses Dokument enthält personenbezogene Informationen und unterliegt DSGVO-Richtlinien.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
