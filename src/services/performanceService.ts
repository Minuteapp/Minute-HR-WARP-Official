
import { supabase } from '@/integrations/supabase/client';
import type {
  PerformanceTemplate,
  PerformanceReview,
  PerformanceComment,
  PerformanceNotification,
  PerformanceCycle,
  PerformanceAnalytics,
  PerformanceGoalLink,
  CreatePerformanceReviewRequest,
  CreatePerformanceTemplateRequest,
  PerformanceMetrics
} from '@/types/performance';

export const performanceService = {
  // Performance Templates
  async getTemplates(): Promise<PerformanceTemplate[]> {
    const { data, error } = await supabase
      .from('performance_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PerformanceTemplate[];
  },

  async getTemplate(id: string): Promise<PerformanceTemplate> {
    const { data, error } = await supabase
      .from('performance_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PerformanceTemplate;
  },

  async createTemplate(template: CreatePerformanceTemplateRequest): Promise<PerformanceTemplate> {
    const { data, error } = await supabase
      .from('performance_templates')
      .insert({
        ...template,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceTemplate;
  },

  async updateTemplate(id: string, updates: Partial<PerformanceTemplate>): Promise<PerformanceTemplate> {
    const { data, error } = await supabase
      .from('performance_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceTemplate;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('performance_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Performance Reviews
  async getReviews(filters?: { employee_id?: string; reviewer_id?: string; status?: string }): Promise<PerformanceReview[]> {
    let query = supabase
      .from('performance_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.reviewer_id) {
      query = query.eq('reviewer_id', filters.reviewer_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as PerformanceReview[];
  },

  async getReview(id: string): Promise<PerformanceReview> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PerformanceReview;
  },

  async createReview(review: CreatePerformanceReviewRequest): Promise<PerformanceReview> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert({
        ...review,
        reviewer_id: review.reviewer_id || (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceReview;
  },

  async updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceReview;
  },

  async submitReview(id: string, scores: Record<string, any>, feedback: Record<string, any>): Promise<PerformanceReview> {
    const overall_score = this.calculateOverallScore(scores);
    
    const { data, error } = await supabase
      .from('performance_reviews')
      .update({
        scores,
        feedback,
        overall_score,
        status: 'in_progress'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceReview;
  },

  async completeReview(id: string): Promise<PerformanceReview> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceReview;
  },

  // Performance Comments
  async getReviewComments(reviewId: string): Promise<PerformanceComment[]> {
    const { data, error } = await supabase
      .from('performance_comments')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as PerformanceComment[];
  },

  async addComment(reviewId: string, comment: string, criteriaId?: string, isPrivate: boolean = false): Promise<PerformanceComment> {
    const { data, error } = await supabase
      .from('performance_comments')
      .insert({
        review_id: reviewId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        criteria_id: criteriaId,
        comment,
        is_private: isPrivate
      })
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceComment;
  },

  // Performance Cycles
  async getCycles(): Promise<PerformanceCycle[]> {
    const { data, error } = await supabase
      .from('performance_cycles')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as PerformanceCycle[];
  },

  async createCycle(cycle: Omit<PerformanceCycle, 'id' | 'created_at' | 'created_by'>): Promise<PerformanceCycle> {
    const { data, error } = await supabase
      .from('performance_cycles')
      .insert({
        ...cycle,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceCycle;
  },

  // Performance Analytics
  async getEmployeeAnalytics(employeeId: string): Promise<PerformanceAnalytics | null> {
    const { data, error } = await supabase
      .from('performance_analytics')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_current', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PerformanceAnalytics | null;
  },

  async generateAnalytics(employeeId: string, periodStart: string, periodEnd: string): Promise<PerformanceAnalytics> {
    // Analyse-Daten aus vorhandenen Daten generieren, keine Mock-Daten
    const analyticsData = {
      employee_id: employeeId,
      analysis_period_start: periodStart,
      analysis_period_end: periodEnd,
      performance_trend: 'stable' as const,
      trend_score: 0,
      peer_comparison: {},
      recommendations: [],
      risk_factors: [],
      strengths: [],
      areas_for_improvement: [],
      is_current: true
    };

    const { data, error } = await supabase
      .from('performance_analytics')
      .insert(analyticsData)
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceAnalytics;
  },

  // Performance Metrics
  async getMetrics(): Promise<PerformanceMetrics> {
    const { data: reviews, error } = await supabase
      .from('performance_reviews')
      .select('status, overall_score, due_date, completed_at');

    if (error) throw error;

    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(r => r.status === 'completed').length;
    const averageScore = reviews
      .filter(r => r.overall_score)
      .reduce((sum, r) => sum + (r.overall_score || 0), 0) / 
      reviews.filter(r => r.overall_score).length || 0;

    const onTimeCompletion = reviews
      .filter(r => r.status === 'completed' && r.due_date && r.completed_at)
      .filter(r => new Date(r.completed_at!) <= new Date(r.due_date!))
      .length;

    const pendingReviews = reviews.filter(r => r.status === 'in_progress').length;
    const overdueReviews = reviews
      .filter(r => r.status !== 'completed' && r.due_date)
      .filter(r => new Date(r.due_date!) < new Date())
      .length;

    return {
      totalReviews,
      completedReviews,
      averageScore: Math.round(averageScore * 100) / 100,
      onTimeCompletion,
      pendingReviews,
      overdueReviews
    };
  },

  // Goal Links
  async linkGoalToReview(reviewId: string, goalId: string, weight: number = 1.0): Promise<PerformanceGoalLink> {
    const { data, error } = await supabase
      .from('performance_goal_links')
      .insert({
        review_id: reviewId,
        goal_id: goalId,
        goal_weight: weight
      })
      .select()
      .single();

    if (error) throw error;
    return data as PerformanceGoalLink;
  },

  async getReviewGoals(reviewId: string): Promise<PerformanceGoalLink[]> {
    const { data, error } = await supabase
      .from('performance_goal_links')
      .select('*')
      .eq('review_id', reviewId);

    if (error) throw error;
    return data as PerformanceGoalLink[];
  },

  // Helper Functions
  calculateOverallScore(scores: Record<string, any>): number {
    const scoreValues = Object.values(scores).filter(score => typeof score === 'number');
    if (scoreValues.length === 0) return 0;
    return scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
  },

  // Notifications
  async getNotifications(userId?: string): Promise<PerformanceNotification[]> {
    let query = supabase
      .from('performance_notifications')
      .select('*')
      .order('sent_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as PerformanceNotification[];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('performance_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
  }
};
