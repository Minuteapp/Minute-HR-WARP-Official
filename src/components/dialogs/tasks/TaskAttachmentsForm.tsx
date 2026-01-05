
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Download } from "lucide-react";

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface TaskAttachmentsFormProps {
  attachments: Attachment[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TaskAttachmentsForm = ({
  attachments,
  handleFileChange
}: TaskAttachmentsFormProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📄';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Anhänge</Label>
        <div className="border-2 border-dashed border-[#9b87f5] rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-[#9b87f5] mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Dateien hier ablegen oder klicken zum Auswählen
          </p>
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="border-[#9b87f5]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Dateien auswählen
          </Button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label>Hochgeladene Dateien ({attachments.length})</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFileIcon(attachment.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="h-6 w-6 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
