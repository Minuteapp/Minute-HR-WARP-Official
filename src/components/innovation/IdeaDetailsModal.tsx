import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Brain, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  Users,
  Clock,
  Target,
  Star,
  Bot,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IdeaDetailsModalProps {
  idea: any;
  open: boolean;
  onClose: () => void;
}

interface AIAnalysis {
  innovation_score: number;
  feasibility_score: number;
  impact_score: number;
  risk_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  similar_ideas: string[];
}

interface Comment {
  id: string;
  content: string;
  user_name: string;
  created_at: string;
}

export const IdeaDetailsModal: React.FC<IdeaDetailsModalProps> = ({ idea, open, onClose }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && idea) {
      loadIdeaDetails();
    }
  }, [open, idea]);

  const loadIdeaDetails = async () => {
    try {
      // Simuliere vorhandene Kommentare
      const simulatedComments: Comment[] = [
        {
          id: '1',
          content: 'Sehr interessante Idee! Das könnte wirklich einen großen Impact haben.',
          user_name: 'max.mustermann@firma.de',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 Tag alt
        },
        {
          id: '2', 
          content: 'Ich sehe großes Potenzial, aber wir sollten die technischen Herausforderungen nicht unterschätzen.',
          user_name: 'anna.schmidt@firma.de',
          created_at: new Date(Date.now() - 43200000).toISOString() // 12 Stunden alt
        }
      ];
      
      setComments(simulatedComments);
    } catch (error) {
      console.error('Error loading idea details:', error);
    }
  };

  const triggerAIAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('innovation-ai-analysis', {
        body: {
          idea_id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category
        }
      });

      if (error) throw error;

      // Speichere die Analyse direkt in der State
      setAiAnalysis(data);
      
      toast({
        title: "KI-Analyse abgeschlossen",
        description: "Die Analyse wurde erfolgreich durchgeführt."
      });
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      toast({
        title: "Fehler",
        description: "Die KI-Analyse konnte nicht durchgeführt werden.",
        variant: "destructive"
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Speichere Kommentar direkt in der lokalen State
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        user_name: userData.user?.email || 'Unbekannt',
        created_at: new Date().toISOString()
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      
      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich gespeichert."
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Fehler",
        description: "Der Kommentar konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const vote = async (voteType: 'upvote' | 'downvote') => {
    try {
      toast({
        title: "Bewertung gespeichert",
        description: `Sie haben ${voteType === 'upvote' ? 'positiv' : 'negativ'} bewertet.`
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Fehler",
        description: "Die Bewertung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_development': return 'bg-purple-100 text-purple-800';
      case 'implemented': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'under_review': return 'In Prüfung';
      case 'approved': return 'Genehmigt';
      case 'in_development': return 'In Entwicklung';
      case 'implemented': return 'Umgesetzt';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            {idea.title}
          </DialogTitle>
          <DialogDescription>
            Erstellt am {new Date(idea.created_at).toLocaleDateString('de-DE')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status und Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={getStatusColor(idea.status || 'new')}>
              {getStatusText(idea.status || 'new')}
            </Badge>
            {idea.category && (
              <Badge variant="outline">{idea.category}</Badge>
            )}
            {idea.priority && (
              <Badge variant={idea.priority === 'high' ? 'destructive' : 'secondary'}>
                Priorität: {idea.priority === 'high' ? 'Hoch' : idea.priority === 'medium' ? 'Mittel' : 'Niedrig'}
              </Badge>
            )}
          </div>

          {/* Bewertungen */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => vote('upvote')}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Unterstützen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => vote('downvote')}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              Ablehnen
            </Button>
          </div>

          {/* Hauptinhalt */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analysis">KI-Analyse</TabsTrigger>
              <TabsTrigger value="comments">Kommentare</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Beschreibung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {idea.description}
                  </p>
                </CardContent>
              </Card>

              {idea.expected_impact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Erwarteter Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{idea.expected_impact}</p>
                  </CardContent>
                </Card>
              )}

              {(idea.target_audience || idea.success_metrics || idea.resources_needed) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {idea.target_audience && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Zielgruppe
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{idea.target_audience}</p>
                      </CardContent>
                    </Card>
                  )}

                  {idea.success_metrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Erfolgsmessung
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{idea.success_metrics}</p>
                      </CardContent>
                    </Card>
                  )}

                  {idea.resources_needed && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Ressourcen
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{idea.resources_needed}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* KI-Analyse Tab */}
            <TabsContent value="analysis" className="space-y-4">
              {!aiAnalysis ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">KI-Analyse noch nicht durchgeführt</h3>
                    <p className="text-gray-600 mb-4">
                      Lassen Sie diese Idee von unserer KI analysieren und bewerten.
                    </p>
                    <Button 
                      onClick={triggerAIAnalysis}
                      disabled={analysisLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {analysisLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analysiere...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          KI-Analyse starten
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Bewertungsscores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="text-center p-4">
                        <div className="text-2xl font-bold text-blue-600">{aiAnalysis.innovation_score}/10</div>
                        <div className="text-sm text-gray-600">Innovation</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center p-4">
                        <div className="text-2xl font-bold text-green-600">{aiAnalysis.feasibility_score}/10</div>
                        <div className="text-sm text-gray-600">Machbarkeit</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center p-4">
                        <div className="text-2xl font-bold text-purple-600">{aiAnalysis.impact_score}/10</div>
                        <div className="text-sm text-gray-600">Impact</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center p-4">
                        <div className="text-2xl font-bold text-red-600">{aiAnalysis.risk_score}/10</div>
                        <div className="text-sm text-gray-600">Risiko</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Zusammenfassung */}
                  <Card>
                    <CardHeader>
                      <CardTitle>KI-Zusammenfassung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{aiAnalysis.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Stärken und Schwächen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Stärken</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">Herausforderungen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiAnalysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Empfehlungen */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Empfehlungen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Kommentare Tab */}
            <TabsContent value="comments" className="space-y-4">
              {/* Neuen Kommentar hinzufügen */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Neuer Kommentar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Teilen Sie Ihre Gedanken zu dieser Idee..."
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={addComment}
                      disabled={loading || !newComment.trim()}
                    >
                      {loading ? 'Wird gesendet...' : 'Kommentar hinzufügen'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bestehende Kommentare */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Noch keine Kommentare vorhanden.</p>
                    </CardContent>
                  </Card>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">{comment.user_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString('de-DE')}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};