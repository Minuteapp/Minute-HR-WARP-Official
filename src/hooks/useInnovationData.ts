import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Idea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  expected_impact?: string;
  implementation_effort?: 'low' | 'medium' | 'high';
  target_audience?: string;
  success_metrics?: string;
  resources_needed?: string;
  timeline_estimate?: string;
  tags?: string[];
  status: string;
  submitter_id: string;
  impact_score?: number;
  complexity_score?: number;
  strategic_fit?: number;
  predicted_success_probability?: number;
  estimated_roi?: number;
  created_at: string;
  updated_at: string;
  attachments?: any[];
  linked_projects?: any[];
  linked_goals?: any[];
  linked_budget_items?: any[];
  votes?: { score: number }[];
  comments?: any[];
}

interface InnovationStats {
  totalIdeas: number;
  newThisMonth: number;
  averageImpact: number;
  inProgress: number;
  totalVotes: number;
  completedIdeas: number;
  avgROI: number;
  successRate: number;
}

export const useInnovationData = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InnovationStats | null>(null);
  const { toast } = useToast();

  const fetchIdeas = async () => {
    try {
      setLoading(true);

      // Fetch ideas (without votes and comments for now)
      const { data: ideasData, error: ideasError } = await supabase
        .from('innovation_ideas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (ideasError) {
        throw ideasError;
      }

      setIdeas(ideasData || []);

      // Calculate stats
      if (ideasData) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const newThisMonth = ideasData.filter(idea => {
          const createdDate = new Date(idea.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        const averageImpact = ideasData.reduce((sum, idea) => sum + (idea.impact_score || 0), 0) / ideasData.length;
        const inProgress = ideasData.filter(idea => idea.status === 'in_progress').length;
        const completedIdeas = ideasData.filter(idea => idea.status === 'completed').length;
        const totalVotes = 0; // Voting system wird später implementiert
        const avgROI = ideasData.reduce((sum, idea) => sum + (idea.estimated_roi || 0), 0) / ideasData.length;
        const successRate = ideasData.length > 0 ? (completedIdeas / ideasData.length) * 100 : 0;

        setStats({
          totalIdeas: ideasData.length,
          newThisMonth,
          averageImpact: parseFloat(averageImpact.toFixed(1)),
          inProgress,
          totalVotes,
          completedIdeas,
          avgROI: parseFloat(avgROI.toFixed(0)),
          successRate: parseFloat(successRate.toFixed(0))
        });
      }

    } catch (error) {
      console.error('Error fetching innovation data:', error);
      toast({
        title: "Fehler",
        description: "Beim Laden der Innovation-Daten ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createIdea = async (ideaData: Partial<Idea>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('innovation_ideas')
        .insert([
          {
            ...ideaData,
            submitter_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh data
      await fetchIdeas();

      return data;
    } catch (error) {
      console.error('Error creating idea:', error);
      throw error;
    }
  };

  const voteOnIdea = async (ideaId: string, score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upsert vote (insert or update if exists)
      const { error } = await supabase
        .from('innovation_votes')
        .upsert(
          {
            idea_id: ideaId,
            voter_id: user.id,
            score: score
          },
          {
            onConflict: 'idea_id,voter_id'
          }
        );

      if (error) {
        throw error;
      }

      // Refresh data
      await fetchIdeas();

    } catch (error) {
      console.error('Error voting on idea:', error);
      throw error;
    }
  };

  const commentOnIdea = async (ideaId: string, commentText: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('innovation_comments')
        .insert([
          {
            idea_id: ideaId,
            commenter_id: user.id,
            comment_text: commentText
          }
        ]);

      if (error) {
        throw error;
      }

      // Refresh data
      await fetchIdeas();

    } catch (error) {
      console.error('Error commenting on idea:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return {
    ideas,
    loading,
    stats,
    refetch: fetchIdeas,
    createIdea,
    voteOnIdea,
    commentOnIdea
  };
};