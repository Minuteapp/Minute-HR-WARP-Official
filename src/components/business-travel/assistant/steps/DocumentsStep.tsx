
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AssistantStepData } from "@/types/business-travel";
import { Upload, FileText, X, File, FileImage } from "lucide-react";

interface DocumentsStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({ data, updateData }) => {
  const [documents, setDocuments] = useState<File[]>(
    data.documents || []
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const newFiles = Array.from(fileList);
      const updatedDocuments = [...documents, ...newFiles];
      setDocuments(updatedDocuments);
      updateData({ documents: updatedDocuments });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      const newFiles = Array.from(fileList);
      const updatedDocuments = [...documents, ...newFiles];
      setDocuments(updatedDocuments);
      updateData({ documents: updatedDocuments });
    }
  };

  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments.splice(index, 1);
    setDocuments(updatedDocuments);
    updateData({ documents: updatedDocuments });
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Dokumente (optional)</h2>
        <p className="text-gray-600 mb-6">
          Hier können Sie relevante Dokumente für Ihre Reise hochladen, wie z.B. Einladungen, Agenden oder Kostenvoranschläge.
        </p>
      </div>

      <div className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <Label htmlFor="file-upload" className="block text-sm font-medium mb-1">
            Ziehen Sie Dateien hierher oder klicken Sie zum Hochladen
          </Label>
          <p className="text-xs text-gray-500 mb-3">
            PDF, DOC, DOCX, JPG, PNG (max. 10MB)
          </p>
          <Button variant="outline" size="sm" asChild>
            <Label htmlFor="file-upload" className="cursor-pointer">
              Dateien auswählen
            </Label>
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {documents.length > 0 && (
          <div className="space-y-2">
            <Label>Hochgeladene Dokumente:</Label>
            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
              {documents.map((doc, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(doc)}
                    <div className="overflow-hidden">
                      <p className="truncate font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Hilfreiche Dokumente</h3>
        <p className="text-sm text-blue-700">
          Relevante Dokumente wie Einladungsschreiben, Veranstaltungsagenda oder Kostenvoranschläge können den Genehmigungsprozess beschleunigen. 
          Die Dokumente werden sicher mit Ihrem Reiseantrag gespeichert.
        </p>
      </div>
    </div>
  );
};

export default DocumentsStep;
