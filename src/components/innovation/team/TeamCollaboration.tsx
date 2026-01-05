import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Send,
  User,
  Target,
  ArrowRight
} from 'lucide-react';

interface TeamDiscussion {
  id: string;
  idea_id: string;
  user_id: string;
  discussion_type: 'comment' | 'todo' | 'decision' | 'vote';
  content: string;
  status: 'open' | 'resolved' | 'archived';
  assigned_to?: string;
  due_date?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface TeamCollaborationProps {
  ideaId: string;
  ideaTitle: string;
  onCreateProject?: () => void;
}

export const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ 
  ideaId, 
  ideaTitle, 
  onCreateProject 
}) => {
  const [discussions, setDiscussions] = useState<TeamDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [todoAssignee, setTodoAssignee] = useState('');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'todos' | 'decisions'>('comments');
  const { toast } = useToast();

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('innovation_team_discussions')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Team-Diskussionen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('innovation_team_discussions')
        .insert([{
          idea_id: ideaId,
          user_id: user.id,
          discussion_type: 'comment',
          content: newComment,
          status: 'open'
        }]);

      if (error) throw error;

      setNewComment('');
      await fetchDiscussions();

      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen des Kommentars",
        variant: "destructive"
      });
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('innovation_team_discussions')
        .insert([{
          idea_id: ideaId,
          user_id: user.id,
          discussion_type: 'todo',
          content: newTodo,
          status: 'open',
          assigned_to: todoAssignee || user.id,
          due_date: todoDueDate || null,
          metadata: {
            assignee_name: todoAssignee || 'Selbst zugewiesen'
          }
        }]);

      if (error) throw error;

      setNewTodo('');
      setTodoAssignee('');
      setTodoDueDate('');
      await fetchDiscussions();

      toast({
        title: "Todo hinzugefügt",
        description: "Das Todo wurde erfolgreich erstellt.",
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen des Todos",
        variant: "destructive"
      });
    }
  };

  const toggleTodoStatus = async (discussionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
      
      const { error } = await supabase
        .from('innovation_team_discussions')
        .update({ status: newStatus })
        .eq('id', discussionId);

      if (error) throw error;

      await fetchDiscussions();

      toast({
        title: newStatus === 'resolved' ? "Todo erledigt" : "Todo wieder geöffnet",
        description: "Status wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating todo status:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Todo-Status",
        variant: "destructive"
      });
    }
  };

  const createProjectFromIdea = () => {
    // This would typically navigate to the project creation form
    toast({
      title: "Projekt wird erstellt",
      description: `Ein neues Projekt basierend auf "${ideaTitle}" wird erstellt...`,
    });
    
    if (onCreateProject) {
      onCreateProject();
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [ideaId]);

  const getDiscussionsByType = (type: string) => {
    return discussions.filter(d => d.discussion_type === type);
  };

  const getStatusIcon = (discussion: TeamDiscussion) => {
    if (discussion.discussion_type === 'todo') {
      return discussion.status === 'resolved' ? 
        <CheckCircle className="w-4 h-4 text-green-500" /> : 
        <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <MessageSquare className="w-4 h-4 text-blue-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const comments = getDiscussionsByType('comment');
  const todos = getDiscussionsByType('todo');
  const decisions = getDiscussionsByType('decision');
  const openTodos = todos.filter(t => t.status === 'open');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="text-2xl font-bold">Team-Kollaboration</h3>
          <p className="text-muted-foreground">
            Arbeiten Sie als Team an "{ideaTitle}"
          </p>
        </div>
        <Button
          onClick={createProjectFromIdea}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Projekt erstellen
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kommentare</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Todos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{openTodos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erledigte Todos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {todos.filter(t => t.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team-Aktivität</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discussions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'comments', label: 'Kommentare', icon: MessageSquare, count: comments.length },
            { id: 'todos', label: 'Todos', icon: CheckSquare, count: todos.length },
            { id: 'decisions', label: 'Entscheidungen', icon: AlertCircle, count: decisions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Neuer Kommentar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Teilen Sie Ihre Gedanken zu dieser Idee..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Kommentar hinzufügen
                </Button>
              </CardContent>
            </Card>

            {/* Comments List */}
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Team-Mitglied</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {comments.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Noch keine Kommentare</h3>
                  <p className="text-muted-foreground text-center">
                    Seien Sie der Erste, der einen Kommentar zu dieser Idee hinterlässt.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Todos Tab */}
        {activeTab === 'todos' && (
          <div className="space-y-4">
            {/* Add Todo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Neues Todo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Was muss getan werden?"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Zuweisen an (optional)"
                    value={todoAssignee}
                    onChange={(e) => setTodoAssignee(e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Fälligkeitsdatum (optional)"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                  />
                </div>
                <Button onClick={addTodo} disabled={!newTodo.trim()}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Todo hinzufügen
                </Button>
              </CardContent>
            </Card>

            {/* Todos List */}
            {todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={todo.status === 'resolved' ? 'opacity-70' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTodoStatus(todo.id, todo.status)}
                        className="p-0 h-6 w-6"
                      >
                        {getStatusIcon(todo)}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Todo</span>
                          <Badge variant={todo.status === 'resolved' ? 'default' : 'outline'}>
                            {todo.status === 'resolved' ? 'Erledigt' : 'Offen'}
                          </Badge>
                          {todo.due_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(todo.due_date).toLocaleDateString('de-DE')}</span>
                            </div>
                          )}
                        </div>
                        <p className={`${todo.status === 'resolved' ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Erstellt: {formatDate(todo.created_at)}</span>
                          {todo.assigned_to && (
                            <span>• Zugewiesen an: {todo.metadata?.assignee_name || 'Team-Mitglied'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {todos.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Todos vorhanden</h3>
                  <p className="text-muted-foreground text-center">
                    Erstellen Sie das erste Todo für diese Idee.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Decisions Tab */}
        {activeTab === 'decisions' && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Entscheidungen</h3>
              <p className="text-muted-foreground text-center">
                Hier werden wichtige Entscheidungen zu dieser Idee dokumentiert.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};