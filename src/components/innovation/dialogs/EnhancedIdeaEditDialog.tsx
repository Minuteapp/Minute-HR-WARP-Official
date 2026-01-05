import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit, 
  MessageCircle, 
  Users, 
  Target, 
  Calendar, 
  Tag, 
  Send,
  Paperclip,
  Star,
  TrendingUp,
  FileText,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Comment {
  id: string;
  commenter_id: string;
  comment_text: string;
  created_at: string;
  is_private: boolean;
  commenter_name?: string;
  commenter_avatar?: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface EnhancedIdeaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    status?: string;
    impact_score?: number;
    complexity_score?: number;
    submitter_id: string;
    business_case?: string;
    target_audience?: string;
    implementation_timeline?: string;
    required_resources?: string;
    success_metrics?: string;
  };
  onSave?: (updates: any) => void;
}

export const EnhancedIdeaEditDialog: React.FC<EnhancedIdeaEditDialogProps> = ({
  open,
  onOpenChange,
  idea,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: idea.title,
    description: idea.description || '',
    category: idea.category || '',
    tags: idea.tags || [],
    status: idea.status || 'new',
    business_case: idea.business_case || '',
    target_audience: idea.target_audience || '',
    implementation_timeline: idea.implementation_timeline || '',
    required_resources: idea.required_resources || '',
    success_metrics: idea.success_metrics || '',
    impact_score: idea.impact_score || 5,
    complexity_score: idea.complexity_score || 5
  });

  useEffect(() => {
    if (open) {
      fetchComments();
      fetchTeamMembers();
    }
  }, [open, idea.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('innovation_comments')
        .select(`
          *,
          commenter:commenter_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        ...comment,
        commenter_name: (comment.commenter as any)?.raw_user_meta_data?.full_name || 
                       (comment.commenter as any)?.email?.split('@')[0] || 
                       'Unbekannt',
        commenter_avatar: (comment.commenter as any)?.raw_user_meta_data?.avatar_url
      })) || [];

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Hole Team-Mitglieder basierend auf Idea Votes/Comments
      const { data, error } = await supabase
        .from('innovation_votes')
        .select(`
          voter_id,
          voter:voter_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('idea_id', idea.id);

      if (error) throw error;

      const members = data?.map(vote => ({
        id: vote.voter_id,
        name: (vote.voter as any)?.raw_user_meta_data?.full_name || 
              (vote.voter as any)?.email?.split('@')[0] || 
              'Team Mitglied',
        avatar: (vote.voter as any)?.raw_user_meta_data?.avatar_url,
        role: 'Bewerter'
      })) || [];

      // Entferne Duplikate
      const uniqueMembers = members.filter((member, index, self) =>
        index === self.findIndex(m => m.id === member.id)
      );

      setTeamMembers(uniqueMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('innovation_ideas')
        .update(formData)
        .eq('id', idea.id);

      if (error) throw error;

      toast({
        title: "Idee aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });

      onSave?.(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating idea:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Änderungen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { error } = await supabase
        .from('innovation_comments')
        .insert([{
          idea_id: idea.id,
          commenter_id: user.id,
          comment_text: newComment,
          is_private: false
        }]);

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      
      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich gespeichert.",
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

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Idee bearbeiten: {idea.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="business">Business Case</TabsTrigger>
            <TabsTrigger value="comments">Kommentare ({comments.length})</TabsTrigger>
            <TabsTrigger value="team">Team ({teamMembers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="innovation">Innovation</SelectItem>
                      <SelectItem value="process">Prozessverbesserung</SelectItem>
                      <SelectItem value="technology">Technologie</SelectItem>
                      <SelectItem value="product">Produktentwicklung</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="sustainability">Nachhaltigkeit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neu</SelectItem>
                      <SelectItem value="under_review">In Prüfung</SelectItem>
                      <SelectItem value="approved">Genehmigt</SelectItem>
                      <SelectItem value="in_development">In Entwicklung</SelectItem>
                      <SelectItem value="pilot_phase">Pilotphase</SelectItem>
                      <SelectItem value="implemented">Umgesetzt</SelectItem>
                      <SelectItem value="rejected">Abgelehnt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Impact Score: {formData.impact_score}/10</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.impact_score}
                    onChange={(e) => setFormData(prev => ({ ...prev, impact_score: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Komplexität: {formData.complexity_score}/10</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.complexity_score}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity_score: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Tag hinzufügen und Enter drücken"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="business_case">Business Case</Label>
                <Textarea
                  id="business_case"
                  value={formData.business_case}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_case: e.target.value }))}
                  placeholder="Beschreiben Sie den geschäftlichen Nutzen..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="target_audience">Zielgruppe</Label>
                <Textarea
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="Wer profitiert von dieser Idee?"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="implementation_timeline">Umsetzungszeitplan</Label>
                <Textarea
                  id="implementation_timeline"
                  value={formData.implementation_timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, implementation_timeline: e.target.value }))}
                  placeholder="Geschätzte Dauer und Meilensteine..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="required_resources">Benötigte Ressourcen</Label>
                <Textarea
                  id="required_resources"
                  value={formData.required_resources}
                  onChange={(e) => setFormData(prev => ({ ...prev, required_resources: e.target.value }))}
                  placeholder="Personal, Budget, Tools, etc..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="success_metrics">Erfolgsmetriken</Label>
                <Textarea
                  id="success_metrics"
                  value={formData.success_metrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, success_metrics: e.target.value }))}
                  placeholder="Wie wird der Erfolg gemessen?"
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Team-Diskussion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Kommentar hinzufügen..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.commenter_avatar} />
                        <AvatarFallback>
                          {comment.commenter_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.commenter_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { 
                              addSuffix: true, 
                              locale: de 
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment_text}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Noch keine Kommentare. Starten Sie die Diskussion!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Beteiligte Team-Mitglieder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 border rounded">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 col-span-2">
                      Noch keine Team-Mitglieder beteiligt.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading || !formData.title.trim()}>
            {loading ? 'Speichere...' : 'Änderungen speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};