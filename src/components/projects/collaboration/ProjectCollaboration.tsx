import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Paperclip, 
  Send, 
  User, 
  Calendar,
  Download,
  Eye,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  File,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

interface ProjectCollaborationProps {
  projectId: string;
  projectName: string;
}

export const ProjectCollaboration = ({ projectId, projectName }: ProjectCollaborationProps) => {
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Keine Mock-Daten - leeres Array für neue Firmen
  const [comments, setComments] = useState<Comment[]>([]);

  // Keine Mock-Daten - leeres Array für neue Firmen
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'vor ' + diff + 's';
    if (diff < 3600) return 'vor ' + Math.floor(diff / 60) + 'm';
    if (diff < 86400) return 'vor ' + Math.floor(diff / 3600) + 'h';
    return 'vor ' + Math.floor(diff / 86400) + 'd';
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Du',
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    toast.success('Kommentar hinzugefügt');
  };

  const addReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      author: 'Du',
      content: replyText,
      timestamp: new Date(),
      likes: 0,
      replies: []
    };

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyText('');
    setReplyingTo(null);
    toast.success('Antwort hinzugefügt');
  };

  const likeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Kollaboration - {projectName}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Diskussion ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Dateien ({attachments.length})
            </TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Schreibe einen Kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" className="gap-2">
                  <Paperclip className="h-4 w-4" />
                  Anhang
                </Button>
                <Button onClick={addComment} disabled={!newComment.trim()} className="gap-2">
                  <Send className="h-4 w-4" />
                  Senden
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <ScrollArea className="h-96">
              <div className="space-y-4">
                <AnimatePresence>
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-3"
                    >
                      {/* Main Comment */}
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            
                            {/* Attachments */}
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {comment.attachments.map(attachment => (
                                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background rounded border">
                                    {getFileIcon(attachment.type)}
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{attachment.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {formatFileSize(attachment.size)}
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => likeComment(comment.id)}
                              className="gap-1 h-8"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {comment.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(comment.id)}
                              className="gap-1 h-8"
                            >
                              <Reply className="h-3 w-3" />
                              Antworten
                            </Button>
                          </div>

                          {/* Reply Input */}
                          {replyingTo === comment.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2"
                            >
                              <Textarea
                                placeholder="Antwort schreiben..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="resize-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Abbrechen
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => addReply(comment.id)}
                                  disabled={!replyText.trim()}
                                >
                                  Antworten
                                </Button>
                              </div>
                            </motion.div>
                          )}

                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="space-y-3 ml-4 border-l border-muted pl-4">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {reply.author.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted/20 rounded-lg p-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-xs">{reply.author}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatTimeAgo(reply.timestamp)}
                                        </span>
                                      </div>
                                      <p className="text-sm">{reply.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {attachments.length} Dateien hochgeladen
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Paperclip className="h-4 w-4" />
                Datei hochladen
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {attachments.map((attachment, index) => (
                  <motion.div
                    key={attachment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="p-2 bg-primary/10 rounded">
                      {getFileIcon(attachment.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{attachment.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)} • von {attachment.uploadedBy} • {formatTimeAgo(attachment.uploadedAt)}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};