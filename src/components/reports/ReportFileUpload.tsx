
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { useToast } from "@/hooks/use-toast";

interface ReportFileUploadProps {
  reportId: string;
  onUploadComplete?: () => void;
}

const ReportFileUpload = ({ reportId, onUploadComplete }: ReportFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await reportService.addAttachment(reportId, file);
      toast({
        title: "Datei hochgeladen",
        description: "Die Datei wurde erfolgreich hochgeladen.",
      });
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      if (event.target.form) {
        event.target.form.reset();
      }
    }
  };

  return (
    <form className="flex items-center gap-2">
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="max-w-xs"
        accept="*/*"
      />
      <Button type="button" variant="outline" disabled={isUploading}>
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Lädt..." : "Hochladen"}
      </Button>
    </form>
  );
};

export default ReportFileUpload;
