import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InboxViewToggle } from './InboxViewToggle';
import { InboxListView } from './InboxListView';
import { InboxVisualView } from './InboxVisualView';
import { 
  Inbox, 
  Brain, 
  Users, 
  ArrowRight, 
  Calendar,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

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

interface AIAnalysis {
  id: string;
  pros: string[];
  cons: string[];
  opportunities: string[];
  benefits: string[];
  innovation_score: number;
  feasibility_score: number;
  impact_score: number;
  risk_score: number;
  recommendation: string;
  confidence_level: number;
}

export const InnovationInbox: React.FC = () => {
  const [inboxIdeas, setInboxIdeas] = useState<InboxIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'list' | 'visual'>('list');
  const { toast } = useToast();

  const fetchInboxIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('innovation_ideas_inbox')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setInboxIdeas(data || []);
    } catch (error) {
      console.error('Error fetching inbox ideas:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Ideen aus dem Posteingang",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async (idea: InboxIdea) => {
    setAnalyzingIds(prev => new Set(prev).add(idea.id));
    
    try {
      // Update status to show analysis started
      const { error: updateError } = await supabase
        .from('innovation_ideas_inbox')
        .update({ ai_analysis_triggered: true })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      // Call the AI analysis edge function
      const { data, error } = await supabase.functions.invoke('innovation-ai-analysis', {
        body: {
          ideaId: idea.id,
          title: idea.title,
          description: idea.description || '',
          tags: idea.tags || []
        }
      });

      if (error) throw error;

      toast({
        title: "KI-Analyse gestartet",
        description: `Die Analyse für "${idea.title}" wurde erfolgreich gestartet.`,
      });

      // Refresh data to show updated status
      await fetchInboxIdeas();
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Starten der KI-Analyse",
        variant: "destructive"
      });
    } finally {
      setAnalyzingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(idea.id);
        return newSet;
      });
    }
  };

  const moveToMainIdeas = async (idea: InboxIdea) => {
    try {
      // Create idea in main innovation_ideas table using the analysis data from the idea itself
      const { data: newIdea, error: createError } = await supabase
        .from('innovation_ideas')
        .insert([{
          title: idea.title,
          description: idea.description,
          category: idea.category,
          tags: idea.tags,
          submitter_id: idea.submitter_id,
          status: 'approved',
          impact_score: (idea as any).ai_impact_score,
          complexity_score: 11 - ((idea as any).ai_feasibility_score || 5),
          strategic_fit: (idea as any).ai_innovation_score,
          predicted_success_probability: (idea as any).ai_confidence_level ? (idea as any).ai_confidence_level * 100 : 75,
          // Copy AI analysis data to main table
          ai_analysis_metadata: (idea as any).ai_analysis_metadata,
          ai_innovation_score: (idea as any).ai_innovation_score,
          ai_feasibility_score: (idea as any).ai_feasibility_score,
          ai_impact_score: (idea as any).ai_impact_score,
          ai_risk_score: (idea as any).ai_risk_score,
          ai_confidence_level: (idea as any).ai_confidence_level,
          ai_recommendation: (idea as any).ai_recommendation,
          ai_pros: (idea as any).ai_pros,
          ai_cons: (idea as any).ai_cons,
          ai_opportunities: (idea as any).ai_opportunities,
          ai_benefits: (idea as any).ai_benefits
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Update inbox status
      const { error: updateError } = await supabase
        .from('innovation_ideas_inbox')
        .update({ status: 'moved_to_main' })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      toast({
        title: "Idee verschoben",
        description: `"${idea.title}" wurde erfolgreich in die Hauptsammlung verschoben.`,
      });

      await fetchInboxIdeas();
    } catch (error) {
      console.error('Error moving idea:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Verschieben der Idee",
        variant: "destructive"
      });
    }
  };

  const handleEditIdea = async (idea: InboxIdea, updates: Partial<InboxIdea>) => {
    try {
      const { error } = await supabase
        .from('innovation_ideas_inbox')
        .update(updates)
        .eq('id', idea.id);

      if (error) throw error;

      toast({
        title: "Idee aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });

      await fetchInboxIdeas();
    } catch (error) {
      console.error('Error updating idea:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Idee",
        variant: "destructive"
      });
    }
  };

  const handleVote = async (ideaId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('innovation_votes')
        .upsert({
          idea_id: ideaId,
          voter_id: user.id,
          vote_type: voteType,
          score: voteType === 'upvote' ? 1 : -1
        }, {
          onConflict: 'idea_id,voter_id'
        });

      if (error) throw error;
      await fetchInboxIdeas();
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  };

  const handleComment = async (ideaId: string, commentText: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('innovation_comments')
        .insert({
          idea_id: ideaId,
          commenter_id: user.id,
          comment_text: commentText,
          is_private: false
        });

      if (error) throw error;
      await fetchInboxIdeas();
    } catch (error) {
      console.error('Error commenting:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchInboxIdeas();

    // Set up real-time subscription
    const channel = supabase
      .channel('innovation-inbox-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'innovation_ideas_inbox'
        },
        () => {
          fetchInboxIdeas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (idea: InboxIdea) => {
    if (idea.status === 'moved_to_main') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (idea.status === 'rejected') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (idea.ai_analysis_completed) return <Brain className="w-4 h-4 text-blue-500" />;
    if (idea.ai_analysis_triggered) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <Inbox className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = (idea: InboxIdea) => {
    if (idea.status === 'moved_to_main') return 'Verschoben';
    if (idea.status === 'rejected') return 'Abgelehnt';
    if (idea.ai_analysis_completed) return 'Analysiert';
    if (idea.ai_analysis_triggered) return 'Wird analysiert...';
    return 'Wartend';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ideen-Posteingang</h2>
          <p className="text-muted-foreground">
            Neue Ideen werden hier gesammelt und von der KI analysiert, bevor sie in die Hauptsammlung gelangen.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {inboxIdeas.filter(idea => idea.status === 'pending').length} neue Ideen
          </Badge>
          <InboxViewToggle view={currentView} onViewChange={setCurrentView} />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt im Posteingang</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inboxIdeas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartend auf Analyse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inboxIdeas.filter(idea => idea.status === 'pending' && !idea.ai_analysis_triggered).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KI-Analysiert</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inboxIdeas.filter(idea => idea.ai_analysis_completed).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verschoben</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inboxIdeas.filter(idea => idea.status === 'moved_to_main').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on view */}
      {currentView === 'list' ? (
        <InboxListView 
          ideas={inboxIdeas}
          onAnalyze={triggerAIAnalysis}
          onMoveToMain={moveToMainIdeas}
          onEditIdea={handleEditIdea}
          onVote={handleVote}
          onComment={handleComment}
        />
      ) : (
        <InboxVisualView 
          ideas={inboxIdeas}
          onAnalyze={triggerAIAnalysis}
          onMoveToMain={moveToMainIdeas}
          onEditIdea={handleEditIdea}
          onVote={handleVote}
          onComment={handleComment}
        />
      )}
    </div>
  );
};