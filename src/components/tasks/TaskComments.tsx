
import { useState } from "react";
import { Comment } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Paperclip, User, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TaskCommentsProps {
  comments?: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
}

export const TaskComments = ({ comments = [], onCommentsChange }: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: crypto.randomUUID(),
      author: "Sie",
      text: newComment,
      createdAt: new Date().toISOString(),
      attachments: [],
      mentions: []
    };
    
    onCommentsChange([...comments, newCommentObj]);
    setNewComment("");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `vor ${diffInMinutes} ${diffInMinutes === 1 ? 'Minute' : 'Minuten'}`;
      }
      return `vor ${diffInHours} ${diffInHours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    
    if (diffInHours < 48) {
      return 'Gestern';
    }
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Kommentare & Diskussionen</h3>
      
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-[#9b87f5] text-white text-xs">
                {getInitials(comment.author)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{comment.author}</span>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">
                    {formatDate(comment.createdAt)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3 text-gray-500" />
                  </Button>
                </div>
              </div>
              <p className="text-sm mt-1">{comment.text}</p>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-6">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Keine Kommentare vorhanden</p>
            <p className="text-xs text-gray-400 mt-1">Fügen Sie den ersten Kommentar hinzu</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 border rounded-lg p-2 bg-white">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-[#9b87f5] text-white text-xs">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <Input 
          placeholder="Kommentar hinzufügen..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newComment.trim()) {
              handleAddComment();
            }
          }}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="h-4 w-4 text-gray-500" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            className="h-8 w-8 bg-[#9b87f5] hover:bg-[#8e7aef]"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
