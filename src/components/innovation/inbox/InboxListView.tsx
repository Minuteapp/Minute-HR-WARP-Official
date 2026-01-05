import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit, Sparkles, ArrowRight, Calendar, Tag, FileText, ThumbsUp, ThumbsDown, Target } from 'lucide-react';
import { IdeaRatingView } from '../rating/IdeaRatingView';
import { formatFileSize } from '@/utils/documentUtils';
import { IdeaToProjectDialog } from '../dialogs/IdeaToProjectDialog';
import { EnhancedIdeaEditDialog } from '../dialogs/EnhancedIdeaEditDialog';

interface InboxIdea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  submitter_id: string;
  submitted_at: string;
  status: 'pending' | 'analyzed' | 'rejected' | 'moved_to_main';
  ai_analysis_triggered: boolean;
  ai_analysis_completed: boolean;
  priority_score: number;
}

interface InboxListViewProps {
  ideas: InboxIdea[];
  onAnalyze: (idea: InboxIdea) => void;
  onMoveToMain: (idea: InboxIdea) => void;
  onEditIdea: (idea: InboxIdea, updates: Partial<InboxIdea>) => void;
  onVote?: (ideaId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  onComment?: (ideaId: string, comment: string) => Promise<void>;
}

export const InboxListView: React.FC<InboxListViewProps> = ({ 
  ideas, 
  onAnalyze, 
  onMoveToMain, 
  onEditIdea,
  onVote,
  onComment
}) => {
  const [editingIdea, setEditingIdea] = useState<InboxIdea | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [ratingIdea, setRatingIdea] = useState<InboxIdea | null>(null);
  const [ideaToProject, setIdeaToProject] = useState<InboxIdea | null>(null);
  const [enhancedEditIdea, setEnhancedEditIdea] = useState<InboxIdea | null>(null);

  const handleEditClick = (idea: InboxIdea) => {
    setEditingIdea(idea);
    setEditForm({
      title: idea.title,
      description: idea.description || '',
      category: idea.category || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingIdea) {
      onEditIdea(editingIdea, editForm);
      setEditingIdea(null);
    }
  };

  const getStatusBadge = (idea: InboxIdea) => {
    if (idea.status === 'moved_to_main') return <Badge className="bg-green-100 text-green-800">Verschoben</Badge>;
    if (idea.status === 'rejected') return <Badge variant="destructive">Abgelehnt</Badge>;
    if (idea.ai_analysis_completed) return <Badge className="bg-blue-100 text-blue-800">Analysiert</Badge>;
    if (idea.ai_analysis_triggered) return <Badge className="bg-yellow-100 text-yellow-800">Wird analysiert</Badge>;
    return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Neu</Badge>;
  };

  if (ideas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ideen-Posteingang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Ideen im Posteingang</h3>
            <p className="text-muted-foreground">
              Neue Ideen erscheinen hier automatisch.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ideen ({ideas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{idea.title}</h3>
                      {getStatusBadge(idea)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate mb-3">
                      {idea.description || 'Keine Beschreibung'}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(idea.submitted_at).toLocaleDateString('de-DE')}</span>
                      </div>
                      {idea.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{idea.category}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setRatingIdea(idea)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Bewerten
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEnhancedEditIdea(idea)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Bearbeiten
                        </Button>
                      </div>

                      <div className="flex gap-1">
                        {!idea.ai_analysis_triggered && idea.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAnalyze(idea)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Analysieren
                          </Button>
                        )}
                        
                        {idea.ai_analysis_completed && idea.status === 'analyzed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMoveToMain(idea)}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Verschieben
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setIdeaToProject(idea)}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Zu Projekt
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      {ratingIdea && onVote && onComment && (
        <IdeaRatingView
          idea={{
            id: ratingIdea.id,
            title: ratingIdea.title,
            description: ratingIdea.description,
            category: ratingIdea.category,
            status: ratingIdea.status
          }}
          onVote={onVote}
          onComment={onComment}
          onClose={() => setRatingIdea(null)}
        />
      )}

      {/* Enhanced Edit Dialog */}
      {enhancedEditIdea && (
        <EnhancedIdeaEditDialog
          open={!!enhancedEditIdea}
          onOpenChange={(open) => !open && setEnhancedEditIdea(null)}
          idea={enhancedEditIdea}
          onSave={(updates) => {
            onEditIdea(enhancedEditIdea, updates);
            setEnhancedEditIdea(null);
          }}
        />
      )}

      {/* Idea to Project Dialog */}
      {ideaToProject && (
        <IdeaToProjectDialog
          open={!!ideaToProject}
          onOpenChange={(open) => !open && setIdeaToProject(null)}
          idea={ideaToProject}
          onSuccess={(projectId) => {
            // Navigate to project or show success message
            setIdeaToProject(null);
          }}
        />
      )}
    </div>
  );
};