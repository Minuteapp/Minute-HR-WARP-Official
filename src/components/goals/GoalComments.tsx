
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { goalService } from '@/services/goalService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Comment {
  id: string;
  comment: string;
  user_id: string;
  created_at: string;
  rating?: number;
}

interface GoalCommentsProps {
  goalId: string;
  canAddComments?: boolean;
  canAddRating?: boolean;
}

export const GoalComments: React.FC<GoalCommentsProps> = ({ 
  goalId, 
  canAddComments = true,
  canAddRating = false 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [goalId]);

  const loadComments = async () => {
    try {
      // In einer echten Implementierung würden wir hier die Kommentare laden
      // Für jetzt simulieren wir leere Kommentare
      setComments([]);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await goalService.addComment(goalId, newComment);
      setNewComment('');
      loadComments();
      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt."
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler",
        description: "Der Kommentar konnte nicht hinzugefügt werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (rating: number) => void; }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 cursor-pointer ${
            star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Kommentare & Bewertungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Neuen Kommentar hinzufügen */}
        {canAddComments && (
          <div className="space-y-3">
            <Textarea
              placeholder="Kommentar hinzufügen..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            
            {canAddRating && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Bewertung:</span>
                <StarRating value={rating} onChange={setRating} />
              </div>
            )}
            
            <Button 
              onClick={handleAddComment} 
              disabled={loading || !newComment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Kommentar hinzufügen
            </Button>
          </div>
        )}

        {/* Kommentare anzeigen */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Benutzer</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'PPP p', { locale: de })}
                    </span>
                    {comment.rating && (
                      <Badge variant="outline" className="ml-auto">
                        <StarRating value={comment.rating} />
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Noch keine Kommentare vorhanden</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
