
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, X, Link, FileText, MessageSquare, History } from "lucide-react";
import type { Document } from "@/types/documents";
import { DocumentLinksDisplay } from "./DocumentLinksDisplay";
import { DocumentLinkingDialog } from "./DocumentLinkingDialog";
import { DocumentComments } from "./DocumentComments";
import { DocumentVersionHistory } from "./DocumentVersionHistory";
import { useState } from "react";

interface DocumentPreviewWithLinksProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentPreviewWithLinks = ({ 
  document, 
  open, 
  onOpenChange 
}: DocumentPreviewWithLinksProps) => {
  const [showLinkingDialog, setShowLinkingDialog] = useState(false);

  if (!document) return null;

  const handleDownload = () => {
    console.log('Download document:', document.id);
  };

  const isImage = document.mime_type?.startsWith('image/');
  const isPdf = document.mime_type === 'application/pdf';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{document.title}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLinkingDialog(true)}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Verknüpfen
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="preview" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Vorschau
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Verknüpfungen
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Kommentare
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Versionen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
              {isImage && (
                <img 
                  src={`/api/documents/${document.file_path}`} 
                  alt={document.title}
                  className="max-w-full h-auto"
                />
              )}
              
              {isPdf && (
                <iframe
                  src={`/api/documents/${document.file_path}`}
                  className="w-full h-[600px] border-0"
                  title={document.title}
                />
              )}
              
              {!isImage && !isPdf && (
                <div className="text-center p-8">
                  <Eye className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Vorschau für diesen Dateityp nicht verfügbar</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Dateityp: {document.mime_type}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="links" className="flex-1 overflow-auto mt-4">
              <DocumentLinksDisplay documentId={document.id} />
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-auto mt-4">
              <DocumentComments documentId={document.id} />
            </TabsContent>

            <TabsContent value="versions" className="flex-1 overflow-auto mt-4">
              <DocumentVersionHistory documentId={document.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DocumentLinkingDialog
        documentId={document?.id || ''}
        open={showLinkingDialog}
        onOpenChange={setShowLinkingDialog}
      />
    </>
  );
};
