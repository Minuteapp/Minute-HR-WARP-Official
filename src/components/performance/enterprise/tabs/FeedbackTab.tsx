import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackKPICards } from "../feedback/FeedbackKPICards";
import { FeedbackFilterBar } from "../feedback/FeedbackFilterBar";
import { ReviewCard } from "../feedback/ReviewCard";
import { CreateReviewModal } from "../feedback/CreateReviewModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const FeedbackTab = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch reviews
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['performance-reviews-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          employees!performance_reviews_employee_id_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch employees for modal
  const { data: employees } = useQuery({
    queryKey: ['feedback-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .order('last_name');
      if (error) throw error;
      return data || [];
    }
  });

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    
    return reviews.filter(review => {
      if (statusFilter === 'all') return true;
      return review.status === statusFilter;
    });
  }, [reviews, statusFilter]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!reviews) return { total: 0, inProgress: 0, overdue: 0, completed: 0 };
    
    return {
      total: reviews.length,
      inProgress: reviews.filter(r => r.status === 'in_progress' || r.status === 'pending').length,
      overdue: reviews.filter(r => r.status === 'overdue').length,
      completed: reviews.filter(r => r.status === 'completed').length
    };
  }, [reviews]);

  // Map reviews with employee names
  const reviewsWithNames = useMemo(() => {
    return filteredReviews.map(review => ({
      id: review.id,
      employee_name: review.employees 
        ? `${(review.employees as any).first_name} ${(review.employees as any).last_name}`
        : 'Unbekannt',
      reviewer_name: review.reviewer_id ? 'Reviewer' : undefined,
      status: review.status || 'pending',
      review_type: (review as any).review_type || 'quarterly',
      period_start: review.period_start,
      period_end: review.period_end,
      scheduled_date: review.created_at
    }));
  }, [filteredReviews]);

  const handleCreateReview = async (data: {
    employee_id: string;
    reviewer_id: string;
    review_type: string;
    scheduled_date: string;
  }) => {
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .insert({
          employee_id: data.employee_id,
          reviewer_id: data.reviewer_id,
          review_type: data.review_type,
          status: 'pending',
          period_start: data.scheduled_date,
          period_end: data.scheduled_date
        });
      
      if (error) throw error;
      
      toast.success('Review erfolgreich erstellt');
      refetch();
    } catch (error) {
      toast.error('Fehler beim Erstellen des Reviews');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-12" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackKPICards
        total={kpis.total}
        inProgress={kpis.inProgress}
        overdue={kpis.overdue}
        completed={kpis.completed}
      />

      <FeedbackFilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onCreateReview={() => setCreateModalOpen(true)}
      />

      <div className="space-y-4">
        {reviewsWithNames.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Reviews gefunden</p>
          </div>
        ) : (
          reviewsWithNames.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              feedbacks={[]}
              onAddFeedback={() => {}}
            />
          ))
        )}
      </div>

      <CreateReviewModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        employees={employees || []}
        onSubmit={handleCreateReview}
      />
    </div>
  );
};
