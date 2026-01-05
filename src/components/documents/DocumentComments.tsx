import { useState } from 'react';
import { useDocumentComments } from '@/hooks/useDocumentComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Send, Edit2, Trash2, MessageSquare, MoreVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCommentsProps {
  documentId: string;
}

export const DocumentComments = ({ documentId }: DocumentCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const { 
    comments, 
    isLoading, 
    createComment, 
    updateComment, 
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting
  } = useDocumentComments(documentId);

  // Aktuellen User laden
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    await createComment({ documentId, commentText: newComment.trim() });
    setNewComment('');
  };

  const handleStartEdit = (commentId: string, text: string) => {
    setEditingId(commentId);
    setEditText(text);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    
    await updateComment({ commentId: editingId, commentText: editText.trim() });
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Kommentar wirklich löschen?')) return;
    await deleteComment(commentId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kommentarliste */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Noch keine Kommentare</p>
          <p className="text-xs mt-1">Fügen Sie den ersten Kommentar hinzu</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.user?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {comment.user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user?.full_name || 'Unbekannt'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: de 
                      })}
                    </span>
                  </div>
                  
                  {currentUser?.id === comment.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleStartEdit(comment.id, comment.comment_text)}
                        >
                          <Edit2 className="h-3 w-3 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(comment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {editingId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                      >
                        Speichern
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm mt-1 text-foreground/90 whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Neuer Kommentar */}
      <div className="border-t pt-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Kommentar schreiben..."
              className="min-h-[80px] text-sm"
            />
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim() || isCreating}
              size="sm"
              className="gap-2"
            >
              <Send className="h-3 w-3" />
              Senden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentComments;
