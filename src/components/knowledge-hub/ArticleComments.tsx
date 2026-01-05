import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { ThumbsUp } from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
}

interface ArticleCommentsProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  isLoading: boolean;
}

// Mock data for display
const mockCommentUsers: Record<string, { name: string; role: string; initials: string; likes: number }> = {
  default: { name: 'Lisa Müller', role: 'Team Lead', initials: 'LM', likes: 5 },
};

export const ArticleComments = ({ comments, onAddComment, isLoading }: ArticleCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment, replyTo || undefined);
    setNewComment('');
    setReplyTo(null);
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId: string) => comments.filter(c => c.parent_comment_id === commentId);

  // Use mock comments if no real comments exist
  const displayComments = comments.length > 0 ? comments : [
    {
      id: '1',
      user_id: '1',
      content: 'Super hilfreich! Könnte man noch Details zur Urlaubsplanung im Team hinzufügen?',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      parent_comment_id: null,
    },
    {
      id: '2',
      user_id: '2',
      content: 'Gibt es eine Möglichkeit, den Status meines Antrags einzusehen?',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      parent_comment_id: null,
    },
  ];

  const displayTopLevelComments = displayComments.filter(c => !c.parent_comment_id);

  return (
    <div className="space-y-6">
      {/* New Comment Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Neuer Kommentar</h4>
        <Textarea
          placeholder="Teilen Sie Ihr Feedback oder stellen Sie Fragen..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-3 bg-white"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => { setNewComment(''); setReplyTo(null); }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!newComment.trim() || isLoading}
            className="bg-gray-900 hover:bg-gray-800"
          >
            Kommentar hinzufügen
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-0 divide-y">
        {displayTopLevelComments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Kommentare vorhanden
          </p>
        ) : (
          displayTopLevelComments.map((comment, index) => {
            const replies = getReplies(comment.id);
            const mockUser = index === 0 
              ? { name: 'Lisa Müller', role: 'Team Lead', initials: 'LM', likes: 5 }
              : { name: 'Thomas Klein', role: 'Mitarbeiter', initials: 'TK', likes: 3 };
            
            return (
              <div key={comment.id} className="py-4">
                <CommentItem 
                  comment={comment} 
                  onReply={setReplyTo} 
                  mockUser={mockUser}
                />
                {replies.map(reply => (
                  <div key={reply.id} className="ml-12 mt-3">
                    <CommentItem 
                      comment={reply} 
                      isReply 
                      mockUser={{ name: 'Mitarbeiter', role: 'Mitarbeiter', initials: 'MA', likes: 1 }}
                    />
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply?: (id: string) => void;
  isReply?: boolean;
  mockUser: { name: string; role: string; initials: string; likes: number };
}

const CommentItem = ({ comment, onReply, isReply, mockUser }: CommentItemProps) => {
  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-blue-100 text-blue-700">
          {mockUser.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{mockUser.name}</span>
          <Badge variant="outline" className="text-xs font-normal">
            {mockUser.role}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: false, locale: de })}
          </span>
        </div>
        <p className="text-sm text-foreground mb-2">{comment.content}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
            <ThumbsUp className="h-3 w-3" />
            {mockUser.likes}
          </span>
          {!isReply && onReply && (
            <span 
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => onReply(comment.id)}
            >
              Antworten
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
