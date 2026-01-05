import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle, XCircle, Eye, User, Calendar, FileText, MessageSquare, X, Loader2 } from 'lucide-react';
import { useKnowledgeArticles } from '@/hooks/useKnowledgeArticles';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const ApprovalQueue = () => {
  const { pendingApprovals, articles, approveArticle, rejectArticle, isLoading } = useKnowledgeArticles();
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtern nach Status aus echten DB-Daten
  const pendingItems = pendingApprovals.filter((a: any) => a.status === 'pending');
  const approvedItems = pendingApprovals.filter((a: any) => a.status === 'approved');
  const rejectedItems = pendingApprovals.filter((a: any) => a.status === 'rejected');

  const pendingCount = pendingItems.length;
  const approvedCount = approvedItems.length;
  const rejectedCount = rejectedItems.length;

  // Hilfsfunktion zum Berechnen der Wartetage
  const calculateWaitingDays = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Hilfsfunktion zum Formatieren des Datums
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
    } catch {
      return dateString;
    }
  };

  const handleApprove = async (approval: any) => {
    try {
      setIsProcessing(true);
      await approveArticle({ 
        approvalId: approval.id, 
        articleId: approval.article_id 
      });
      setSelectedArticle(null);
    } catch (error) {
      console.error('Fehler beim Genehmigen:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (approval: any) => {
    try {
      setIsProcessing(true);
      await rejectArticle({ 
        approvalId: approval.id, 
        articleId: approval.article_id, 
        feedback: rejectFeedback 
      });
      setSelectedArticle(null);
      setShowRejectDialog(false);
      setRejectFeedback('');
    } catch (error) {
      console.error('Fehler beim Ablehnen:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="bg-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Freigabe-Warteschlange</h2>
              <p className="text-sm text-muted-foreground">Artikel zur Prüfung und Freigabe</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Genehmigt</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Abgelehnt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Tabs */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" />
          Ausstehend ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'approved'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Genehmigt ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'rejected'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <XCircle className="h-4 w-4" />
          Abgelehnt ({rejectedCount})
        </button>
      </div>

      {/* Article List */}
      <div className="space-y-4">
        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <>
            {pendingItems.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine ausstehenden Artikel</h3>
                  <p className="text-sm text-gray-500">Es gibt derzeit keine Artikel zur Prüfung.</p>
                </CardContent>
              </Card>
            ) : (
              pendingItems.map((approval: any) => {
                const article = approval.knowledge_articles;
                if (!article) return null;
                
                const waitingDays = calculateWaitingDays(approval.created_at);
                const wordCount = article.word_count || article.content?.split(/\s+/).length || 0;
                
                return (
                  <Card key={approval.id} className="hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{article.category || 'Allgemein'}</Badge>
                        {approval.priority === 'high' && (
                          <Badge className="bg-red-500 text-white text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Hohe Priorität
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.author_name || 'Unbekannt'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(approval.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {waitingDays} {waitingDays === 1 ? 'Tag' : 'Tage'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {wordCount} Wörter
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedArticle({ ...article, approval })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Vorschau
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setSelectedArticle({ ...article, approval });
                            setShowRejectDialog(true);
                          }}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Ablehnen
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(approval)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Genehmigen
                        </Button>
                      </div>
                      
                      <div className="flex gap-6 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Lesbarkeit</p>
                          <p className="text-sm font-medium">Gut ({article.readability_score || 80}%)</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">KI-Qualität</p>
                          <p className="text-sm font-medium">Sehr gut ({article.ai_quality_score || 90}%)</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Vollständigkeit</p>
                          <p className="text-sm font-medium">{article.completeness || 'Vollständig'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}

        {/* Approved Tab */}
        {activeTab === 'approved' && (
          <>
            {approvedItems.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine genehmigten Artikel</h3>
                  <p className="text-sm text-gray-500">Es wurden noch keine Artikel genehmigt.</p>
                </CardContent>
              </Card>
            ) : (
              approvedItems.map((approval: any) => {
                const article = approval.knowledge_articles;
                if (!article) return null;
                
                return (
                  <Card key={approval.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{article.title}</h3>
                        <Badge variant="outline">{article.category || 'Allgemein'}</Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Veröffentlicht
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Autor: {article.author_name || 'Unbekannt'} • Genehmigt: {formatDate(approval.reviewed_at || approval.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}

        {/* Rejected Tab */}
        {activeTab === 'rejected' && (
          <>
            {rejectedItems.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine abgelehnten Artikel</h3>
                  <p className="text-sm text-gray-500">Es wurden keine Artikel abgelehnt.</p>
                </CardContent>
              </Card>
            ) : (
              rejectedItems.map((approval: any) => {
                const article = approval.knowledge_articles;
                if (!article) return null;
                
                return (
                  <Card key={approval.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{article.title}</h3>
                        <Badge variant="outline">{article.category || 'Allgemein'}</Badge>
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Abgelehnt
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Autor: {article.author_name || 'Unbekannt'} • Abgelehnt: {formatDate(approval.reviewed_at || approval.created_at)}
                      </p>
                      
                      {approval.feedback && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                          <div className="flex items-center gap-1 font-medium text-red-700 mb-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>Feedback:</span>
                          </div>
                          <p className="text-sm text-red-600">{approval.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Article Preview Dialog */}
      {selectedArticle && !showRejectDialog && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <DialogTitle className="text-xl font-semibold">{selectedArticle.title}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
                <X className="h-4 w-4 mr-1" />
                Schließen
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{selectedArticle.category || 'Allgemein'}</Badge>
                {selectedArticle.approval?.priority === 'high' && (
                  <Badge className="bg-red-500 text-white">
                    <XCircle className="h-3 w-3 mr-1" />
                    Hohe Priorität
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedArticle.author_name || 'Unbekannt'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedArticle.approval?.created_at || selectedArticle.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{calculateWaitingDays(selectedArticle.approval?.created_at || selectedArticle.created_at)} Tage</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{selectedArticle.word_count || selectedArticle.content?.split(/\s+/).length || 0} Wörter</span>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none mb-6">
                <ReactMarkdown>{selectedArticle.content || ''}</ReactMarkdown>
              </div>
              
              {selectedArticle.tags?.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {selectedArticle.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Qualitätsmetriken</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Lesbarkeit</p>
                      <p className="font-medium">Gut ({selectedArticle.readability_score || 80}%)</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">KI-Qualität</p>
                      <p className="font-medium">Sehr gut ({selectedArticle.ai_quality_score || 90}%)</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Vollständigkeit</p>
                      <p className="font-medium">{selectedArticle.completeness || 'Vollständig'}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Ablehnen
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApprove(selectedArticle.approval)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Genehmigen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && selectedArticle && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Artikel ablehnen</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Bitte geben Sie dem Autor ein konstruktives Feedback, damit der Artikel verbessert werden kann.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mt-2">
              <Textarea
                placeholder="z.B. Der Artikel ist gut strukturiert, aber es fehlen noch Details zu den neuen Prozessschritten. Bitte ergänzen Sie Abschnitt 3 mit konkreten Beispielen."
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                className="min-h-[120px] bg-white border"
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectFeedback('');
                }}
              >
                Abbrechen
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleReject(selectedArticle.approval)}
                disabled={!rejectFeedback.trim() || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : null}
                Ablehnung senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
