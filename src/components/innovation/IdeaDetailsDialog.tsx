
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUp, ChevronDown, MessageCircle, User, Calendar, Tag } from 'lucide-react';
import { useInnovation } from '@/hooks/useInnovation';
import { innovationService } from '@/services/innovationService';

interface IdeaDetailsDialogProps {
  idea: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IdeaDetailsDialog = ({ idea, open, onOpenChange }: IdeaDetailsDialogProps) => {
  const { voteIdea, updateIdeaStatus } = useInnovation();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (idea?.id && open) {
      loadComments();
    }
  }, [idea?.id, open]);

  const loadComments = async () => {
    if (!idea?.id) return;
    
    setIsLoadingComments(true);
    try {
      const commentsData = await innovationService.getComments(idea.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!idea?.id) return;
    
    try {
      await voteIdea({ ideaId: idea.id, voteType });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!idea?.id) return;
    
    try {
      await updateIdeaStatus({ ideaId: idea.id, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!idea?.id || !newComment.trim()) return;
    
    try {
      await innovationService.addComment(idea.id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      in_development: 'bg-purple-100 text-purple-800',
      pilot_phase: 'bg-orange-100 text-orange-800',
      implemented: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      submitted: 'Eingereicht',
      under_review: 'In Prüfung',
      approved: 'Genehmigt',
      in_development: 'In Entwicklung',
      pilot_phase: 'Pilotphase',
      implemented: 'Umgesetzt',
      rejected: 'Abgelehnt',
      archived: 'Archiviert'
    };
    return texts[status] || status;
  };

  if (!idea) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{idea.title}</DialogTitle>
            <Badge className={getStatusColor(idea.status)}>
              {getStatusText(idea.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Main Content */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Beschreibung</h3>
              <p className="text-muted-foreground">{idea.description}</p>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Eingereicht von: {idea.profiles?.full_name || 'Unbekannt'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(idea.created_at).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>

            {/* Tags */}
            {idea.tags && idea.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {(idea.expected_impact || idea.resources_needed || idea.timeline_estimate) && (
              <div className="space-y-3">
                {idea.expected_impact && (
                  <div>
                    <h4 className="font-medium mb-1">Erwarteter Nutzen</h4>
                    <p className="text-sm text-muted-foreground">{idea.expected_impact}</p>
                  </div>
                )}
                {idea.resources_needed && (
                  <div>
                    <h4 className="font-medium mb-1">Benötigte Ressourcen</h4>
                    <p className="text-sm text-muted-foreground">{idea.resources_needed}</p>
                  </div>
                )}
                {idea.timeline_estimate && (
                  <div>
                    <h4 className="font-medium mb-1">Zeitschätzung</h4>
                    <p className="text-sm text-muted-foreground">{idea.timeline_estimate}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between py-4 border-t">
            <div className="flex items-center gap-4">
              {/* Voting */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('upvote')}
                  className="h-8 px-2"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  {idea.votes_count || 0}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('downvote')}
                  className="h-8 px-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{comments.length}</span>
              </div>
            </div>

            {/* Status Change */}
            <Select value={idea.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">Eingereicht</SelectItem>
                <SelectItem value="under_review">In Prüfung</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="in_development">In Entwicklung</SelectItem>
                <SelectItem value="pilot_phase">Pilotphase</SelectItem>
                <SelectItem value="implemented">Umgesetzt</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kommentare</h3>
            
            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Kommentar hinzufügen..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Kommentar hinzufügen
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {isLoadingComments ? (
                <p className="text-muted-foreground">Lade Kommentare...</p>
              ) : comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {comment.profiles?.full_name || 'Unbekannt'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Kommentare vorhanden.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
