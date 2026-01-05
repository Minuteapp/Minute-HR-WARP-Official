import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface IdeaRatingProps {
  idea: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    status?: string;
    votes_count?: number;
    user_vote?: 'upvote' | 'downvote' | null;
  };
  onVote: (ideaId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  onComment: (ideaId: string, comment: string) => Promise<void>;
  onClose: () => void;
}

export const IdeaRatingView: React.FC<IdeaRatingProps> = ({
  idea,
  onVote,
  onComment,
  onClose
}) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    setIsVoting(true);
    try {
      await onVote(idea.id, voteType);
      
      toast({
        title: voteType === 'upvote' ? "Positive Bewertung abgegeben" : "Negative Bewertung abgegeben",
        description: `Ihre Bewertung für "${idea.title}" wurde gespeichert.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Abstimmen",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    setIsCommenting(true);
    try {
      await onComment(idea.id, comment);
      setComment('');
      
      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen des Kommentars",
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const getVoteButtonVariant = (voteType: 'upvote' | 'downvote') => {
    if (idea.user_vote === voteType) return 'default';
    return 'outline';
  };

  const getVoteButtonText = (voteType: 'upvote' | 'downvote') => {
    if (idea.user_vote === voteType) {
      return voteType === 'upvote' ? 'Positiv bewertet' : 'Negativ bewertet';
    }
    return voteType === 'upvote' ? 'Positiv bewerten' : 'Negativ bewerten';
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{idea.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Idea Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Beschreibung</h3>
              <p className="text-muted-foreground">
                {idea.description || 'Keine Beschreibung verfügbar'}
              </p>
            </div>

            {idea.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Kategorie:</span>
                <Badge variant="secondary">{idea.category}</Badge>
              </div>
            )}

            {idea.status && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="outline">{idea.status}</Badge>
              </div>
            )}
          </div>

          {/* Voting Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ihre Bewertung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={getVoteButtonVariant('upvote')}
                    onClick={() => handleVote('upvote')}
                    disabled={isVoting}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {getVoteButtonText('upvote')}
                  </Button>

                  <Button
                    variant={getVoteButtonVariant('downvote')}
                    onClick={() => handleVote('downvote')}
                    disabled={isVoting}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    {getVoteButtonText('downvote')}
                  </Button>
                </div>

                {idea.votes_count !== undefined && (
                  <div className="text-center text-sm text-muted-foreground">
                    Insgesamt {idea.votes_count} Bewertungen
                  </div>
                )}

                {/* Feedback nach Bewertung */}
                {idea.user_vote && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {idea.user_vote === 'upvote' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {idea.user_vote === 'upvote' 
                          ? 'Vielen Dank für Ihre positive Bewertung!' 
                          : 'Vielen Dank für Ihr Feedback!'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {idea.user_vote === 'upvote'
                        ? 'Ihre positive Bewertung hilft dabei, vielversprechende Ideen zu identifizieren und zu priorisieren.'
                        : 'Ihr kritisches Feedback hilft dabei, die Idee zu verbessern oder Alternativen zu entwickeln.'
                      }
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Kommentar hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Teilen Sie Ihre Gedanken zu dieser Idee..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setComment('')}>
                    Zurücksetzen
                  </Button>
                  <Button
                    onClick={handleComment}
                    disabled={!comment.trim() || isCommenting}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kommentar hinzufügen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What happens next info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Was passiert als nächstes?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {idea.user_vote === 'upvote' 
                      ? 'Ideen mit vielen positiven Bewertungen werden für die weitere Entwicklung priorisiert und können in konkrete Projekte umgewandelt werden.'
                      : idea.user_vote === 'downvote'
                      ? 'Ihr Feedback wird vom Innovations-Team ausgewertet und kann zu Verbesserungen der Idee oder neuen Ansätzen führen.'
                      : 'Ihre Bewertung und Kommentare helfen dem Innovations-Team bei der Priorisierung und Weiterentwicklung der Ideen.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};