
import { MoreHorizontal, Download, Edit, Trash, Share, Archive, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { documentService } from "@/services/documentService";
import type { Document } from "@/types/documents";
import { useState } from "react";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface DocumentActionMenuProps {
  document: Document;
  onDocumentUpdated?: () => void;
}

export const DocumentActionMenu = ({ document, onDocumentUpdated }: DocumentActionMenuProps) => {
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useRolePermissions();
  const isAdmin = hasPermission('admin_access');
  const canApprove = hasPermission('admin_access') || hasPermission('manage_documents');

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const { data, error } = await documentService.getDownloadUrl(document.file_path);
      
      if (error) throw error;
      if (!data || !data.signedUrl) throw new Error("Konnte keinen Download-Link erstellen");
      
      // Zugriff protokollieren
      await documentService.logDocumentAccess(document.id, 'download');
      
      // Download-Link öffnen
      window.open(data.signedUrl, '_blank');
      
      toast.success("Download gestartet");
    } catch (error: any) {
      toast.error(`Fehler beim Herunterladen: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await documentService.approveDocument(document.id);
      toast.success("Dokument erfolgreich genehmigt");
      if (onDocumentUpdated) onDocumentUpdated();
    } catch (error: any) {
      toast.error(`Fehler bei der Genehmigung: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await documentService.rejectDocument(document.id);
      toast.success("Dokument wurde abgelehnt");
      if (onDocumentUpdated) onDocumentUpdated();
    } catch (error: any) {
      toast.error(`Fehler bei der Ablehnung: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await documentService.archiveDocument(document.id);
      toast.success("Dokument wurde archiviert");
      if (onDocumentUpdated) onDocumentUpdated();
    } catch (error: any) {
      toast.error(`Fehler beim Archivieren: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Sind Sie sicher, dass Sie dieses Dokument löschen möchten?")) return;
    
    try {
      setLoading(true);
      await documentService.deleteDocument(document.id);
      toast.success("Dokument wurde gelöscht");
      if (onDocumentUpdated) onDocumentUpdated();
    } catch (error: any) {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Menü öffnen</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Herunterladen
        </DropdownMenuItem>
        
        {document.status === 'pending' && document.requires_approval && canApprove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Genehmigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject}>
              <X className="mr-2 h-4 w-4 text-red-500" />
              Ablehnen
            </DropdownMenuItem>
          </>
        )}
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleArchive}
              disabled={document.status === 'archived'}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archivieren
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
