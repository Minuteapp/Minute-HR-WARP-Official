
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageAttachment } from '@/types/chat';
import { Download, ExternalLink, Image, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

interface ChatAttachmentViewerProps {
  messageId: string;
  attachments: MessageAttachment[];
}

const ChatAttachmentViewer = ({ messageId, attachments }: ChatAttachmentViewerProps) => {
  const [activeTab, setActiveTab] = useState<string>(
    attachments.length > 0 ? attachments[0].id : ''
  );
  
  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
        <File className="h-8 w-8 mb-2 opacity-40" />
        <p>Keine Anhänge vorhanden</p>
      </div>
    );
  }
  
  const handleDownload = (attachment: MessageAttachment) => {
    // In einer realen Anwendung würden wir hier die Datei herunterladen
    toast.success(`${attachment.file_name} wird heruntergeladen...`);
  };
  
  const handleOpenExternal = (attachment: MessageAttachment) => {
    // In einer realen Anwendung würden wir hier die Datei in einem neuen Tab öffnen
    window.open(attachment.file_path, '_blank');
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  const renderAttachmentContent = (attachment: MessageAttachment) => {
    if (attachment.file_type.startsWith('image/')) {
      return (
        <div className="flex flex-col items-center justify-center">
          <img 
            src={attachment.file_path} 
            alt={attachment.file_name} 
            className="max-w-full max-h-[300px] object-contain rounded"
          />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-muted/30">
          {getFileIcon(attachment.file_type)}
          <p className="mt-2 text-center">{attachment.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.file_size)}
          </p>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-4">
      {attachments.length > 1 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {attachments.map((attachment) => (
              <TabsTrigger 
                key={attachment.id} 
                value={attachment.id}
                className="flex items-center gap-1"
              >
                {getFileIcon(attachment.file_type)}
                <span className="max-w-[100px] truncate">{attachment.file_name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {attachments.map((attachment) => (
            <TabsContent key={attachment.id} value={attachment.id} className="mt-4">
              {renderAttachmentContent(attachment)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        renderAttachmentContent(attachments[0])
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleOpenExternal(attachments.find(a => a.id === activeTab) || attachments[0])}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          In neuem Tab öffnen
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={() => handleDownload(attachments.find(a => a.id === activeTab) || attachments[0])}
        >
          <Download className="mr-2 h-4 w-4" />
          Herunterladen
        </Button>
      </div>
    </div>
  );
};

export default ChatAttachmentViewer;
