import { useState } from "react";
import { MoreHorizontal, Download, Share2, Edit, Trash2, Eye, FileText, Image, File, Clock, CheckCircle, AlertCircle, Archive, Signature, Tag, Calendar, Settings, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentApprovalManager } from "./DocumentApprovalManager";
import { DigitalSignatureDialog } from "./DigitalSignatureDialog";
import DocumentEditDialog from "./DocumentEditDialog";

import { Document } from "@/types/documents";

interface DocumentCardProps {
  document: Document;
  onUpdate: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onPreview: (document: Document) => void;
}

const DocumentCard = ({ document, onUpdate, onDelete, onPreview }: DocumentCardProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showApprovalManager, setShowApprovalManager] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-8 w-8 text-green-600" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      contract: 'Vertrag',
      certificate: 'Zertifikat',
      training: 'Schulung',
      identification: 'Ausweis',
      policy: 'Richtlinie',
      payroll: 'Lohn & Gehalt',
      visa: 'Visa',
      permit: 'Genehmigung',
      onboarding: 'Onboarding',
      compliance: 'Compliance',
      template: 'Vorlage',
      other: 'Sonstiges'
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const isExpiringSoon = () => {
    if (!document.expiry_date) return false;
    const expiryDate = new Date(document.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Download-Log erstellen
      await supabase.from('document_downloads').insert({
        document_id: document.id,
        download_method: 'direct'
      });

      // Datei herunterladen
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Download starten
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download gestartet",
        description: "Die Datei wird heruntergeladen",
      });

    } catch (error: any) {
      console.error('Download-Fehler:', error);
      toast({
        title: "Download fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Download",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .insert({
          document_id: document.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 Tage
          max_downloads: 5
        })
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${data.share_token}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link kopiert",
        description: "Der Freigabe-Link wurde in die Zwischenablage kopiert",
      });

    } catch (error: any) {
      console.error('Share-Fehler:', error);
      toast({
        title: "Freigabe fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Erstellen des Freigabe-Links",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Datei aus Storage löschen
      await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      onDelete(document.id);
      
    } catch (error: any) {
      console.error('Lösch-Fehler:', error);
      toast({
        title: "Löschen fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Löschen",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        {/* Header mit Datei-Icon und Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getFileIcon(document.file_type)}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-xs text-gray-500">
                {getCategoryLabel(document.category)}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(document)}>
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Lädt..." : "Herunterladen"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Freigeben
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </DropdownMenuItem>
              {document.requires_approval && (
                <DropdownMenuItem onClick={() => setShowApprovalManager(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Genehmigungen
                </DropdownMenuItem>
              )}
              {document.requires_signature && document.signature_status === 'unsigned' && (
                <DropdownMenuItem onClick={() => setShowSignatureDialog(true)}>
                  <Signature className="h-4 w-4 mr-2" />
                  Signieren
                </DropdownMenuItem>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Dokument löschen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sind Sie sicher, dass Sie "{document.title}" löschen möchten? 
                      Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Beschreibung */}
        {document.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Status und Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className={`text-xs ${getStatusColor(document.status)}`}>
            {getStatusIcon(document.status)}
            <span className="ml-1 capitalize">{document.status}</span>
          </Badge>
          
          {document.requires_signature && (
            <Badge variant="outline" className="text-xs">
              <Signature className="h-3 w-3 mr-1" />
              Signatur
            </Badge>
          )}
          
          {isExpiringSoon() && (
            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
              <Calendar className="h-3 w-3 mr-1" />
              Läuft ab
            </Badge>
          )}
          
          {document.is_template && (
            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
              Vorlage
            </Badge>
          )}
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
          <div className="flex items-center space-x-2">
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>v{document.version_number}</span>
          </div>
          <div className="flex items-center space-x-2">
            {document.expiry_date && (
              <span className={isExpiringSoon() ? 'text-orange-600' : ''}>
                {formatDate(document.expiry_date)}
              </span>
            )}
          </div>
        </div>

        {/* Schnellaktionen */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(document)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ansehen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const isFavorite = (document.metadata as any)?.is_favorite;
                const { error } = await supabase
                  .from('documents')
                  .update({ metadata: { ...document.metadata, is_favorite: !isFavorite } })
                  .eq('id', document.id);
                if (!error) {
                  onUpdate({ ...document, metadata: { ...document.metadata, is_favorite: !isFavorite } });
                  toast({ title: isFavorite ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt" });
                }
              }}
              className="text-xs"
            >
              <Star className={`h-3 w-3 ${(document.metadata as any)?.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
      
      {/* Genehmigungsmanager Dialog */}
      {showApprovalManager && (
        <DocumentApprovalManager
          document={document}
          open={showApprovalManager}
          onOpenChange={setShowApprovalManager}
        />
      )}
      
      {/* Digitale Signatur Dialog */}
      {showSignatureDialog && (
        <DigitalSignatureDialog
          documentId={document.id}
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
        />
      )}

      {/* Bearbeiten Dialog */}
      <DocumentEditDialog
        document={document}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

export default DocumentCard;