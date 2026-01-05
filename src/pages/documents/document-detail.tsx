import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Share2, Edit, Clock, FileText, CheckCircle, Sparkles, Send, PenLine, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatFileSize } from '@/utils/documentUtils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { DocumentApprovalDialog } from '@/components/documents/DocumentApprovalDialog';
import { DocumentSignatureDialog } from '@/components/documents/DocumentSignatureDialog';
import { useDocumentComments } from '@/hooks/useDocumentComments';
import { PDFViewer } from '@/components/documents/PDFViewer';
import type { Document } from '@/types/documents';

const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { comments, createComment, isCreating } = useDocumentComments(id);

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id!),
    enabled: !!id,
  });

  const handleDownload = async () => {
    if (!document) return;
    try {
      const { data, error } = await documentService.getDownloadUrl(document.file_path, document.id);
      if (error || !data?.signedUrl) {
        toast.error('Fehler beim Download');
        return;
      }
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      toast.error('Fehler beim Download');
    }
  };

  const handlePreview = async () => {
    if (!document || previewUrl) return;
    try {
      const { data, error } = await documentService.getDownloadUrl(document.file_path, document.id);
      if (error || !data?.signedUrl) {
        toast.error('Fehler beim Laden der Vorschau');
        return;
      }
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      toast.error('Fehler beim Laden der Vorschau');
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim() || !id) return;
    try {
      await createComment({ documentId: id, commentText: comment });
      setComment('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = (user: any) => {
    return user?.raw_user_meta_data?.full_name || user?.email?.split('@')[0] || 'Unbekannt';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Zur Freigabe', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      approved: { label: 'Freigegeben', className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Abgelehnt', className: 'bg-red-100 text-red-800 border-red-200' },
      archived: { label: 'Archiviert', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (isLoading || !document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button and Preview Badge */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Kategorie
            </Button>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Vorschau
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Approval Banner */}
              {document.requires_approval && document.status === 'pending' && (
                <Card className="border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Freigabe erforderlich</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Dieses Dokument benötigt Ihre Freigabe
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowApprovalDialog(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Freigabe erteilen
                      </Button>
                      <Button 
                        variant="default"
                        onClick={() => setShowSignatureDialog(true)}
                      >
                        <PenLine className="h-4 w-4 mr-2" />
                        Jetzt signieren
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Document Preview Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Dokumentenvorschau</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Teilen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Audit-Log
                    </Button>
                  </div>
                </div>
                
                {document.mime_type === 'application/pdf' && previewUrl ? (
                  <div className="h-[500px] border rounded-lg overflow-hidden">
                    <PDFViewer 
                      fileUrl={previewUrl} 
                      fileName={document.file_name}
                    />
                  </div>
                ) : previewUrl ? (
                  document.mime_type.startsWith('image/') ? (
                    <div className="bg-muted rounded-lg h-80 flex items-center justify-center">
                      <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg h-80 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Vorschau für diesen Dateityp nicht verfügbar</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div 
                    className="bg-muted/50 rounded-lg h-80 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors" 
                    onClick={handlePreview}
                  >
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Dokumentenvorschau</p>
                      <p className="text-xs text-muted-foreground mt-1">{document.file_name}</p>
                      <Button variant="link" className="mt-2">Vorschau laden</Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* AI Summary Card */}
              <Card className="p-5 bg-gradient-to-r from-blue-50 to-primary/5 border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">KI-Zusammenfassung</h3>
                    {(() => {
                      const aiSummary = document.description || 
                        (document.metadata as any)?.ai_analysis?.summary;
                      const aiConfidence = (document.metadata as any)?.ai_analysis?.confidence;
                      const aiTags = (document.metadata as any)?.ai_analysis?.tags as string[] | undefined;
                      
                      if (aiSummary) {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-800">{aiSummary}</p>
                            {aiConfidence && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                {aiConfidence}% Konfidenz
                              </Badge>
                            )}
                            {aiTags && aiTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {aiTags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <p className="text-sm text-blue-600 italic">
                          Keine KI-Analyse verfügbar. Dokument erneut hochladen für automatische Analyse.
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </Card>

              {/* Comments Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Kommentare
                    <Badge variant="secondary" className="ml-1">{comments.length}</Badge>
                  </h3>
                </div>
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((commentItem) => {
                      const userName = getUserName(commentItem.user);
                      const initials = getInitials(userName);
                      const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'];
                      const colorIndex = commentItem.user_id.charCodeAt(0) % colors.length;
                      
                      return (
                        <div key={commentItem.id} className="flex gap-3">
                          <Avatar className={`h-8 w-8 ${colors[colorIndex]} flex items-center justify-center text-xs font-medium shrink-0`}>
                            {initials}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(commentItem.created_at), { addSuffix: true, locale: de })}
                              </span>
                            </div>
                            <p className="text-sm break-words">{commentItem.comment_text}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Noch keine Kommentare vorhanden
                    </p>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Kommentar hinzufügen..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSendComment();
                      }
                    }}
                  />
                  <Button onClick={handleSendComment} disabled={!comment.trim() || isCreating} size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Metadata Card */}
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Metadaten</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <div>{getStatusBadge(document.status)}</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Typ</span>
                    <span className="font-medium">{document.document_type || document.file_type || 'Vertrag'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kategorie</span>
                    <span className="font-medium capitalize">{document.category}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mitarbeiter</span>
                    <span className="font-medium">Anna Müller</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Abteilung</span>
                    <span className="font-medium">{document.department || 'Sales'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Erstellt von</span>
                    <span className="font-medium">Sarah Schmidt</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Erstellt am</span>
                    <span className="font-medium">{new Date(document.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Letzte Änderung</span>
                    <span className="font-medium">{new Date(document.updated_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">v{document.version}</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                        Historie
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dateigröße</span>
                    <span className="font-medium">{formatFileSize(document.file_size)}</span>
                  </div>
                </div>
              </Card>

              {/* Signature Status Card */}
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Signaturstatus</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Fortschritt</span>
                      <span className="font-medium">1/2</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 transition-all" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary">
                        AM
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">Anna Müller</div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 shrink-0">
                        Ausstehend
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center font-semibold text-xs text-green-700">
                        SS
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">Sarah Schmidt</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                        Signiert
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <DocumentApprovalDialog 
        document={document} 
        open={showApprovalDialog} 
        onOpenChange={setShowApprovalDialog} 
      />
      <DocumentSignatureDialog 
        document={document} 
        open={showSignatureDialog} 
        onOpenChange={setShowSignatureDialog} 
      />
    </div>
  );
};

export default DocumentDetailPage;
