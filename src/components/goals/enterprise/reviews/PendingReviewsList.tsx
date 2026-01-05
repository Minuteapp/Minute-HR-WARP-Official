import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PendingReviewCard } from "./PendingReviewCard";
import { addDays, isBefore } from "date-fns";

export const PendingReviewsList = () => {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals-pending-reviews'],
    queryFn: async () => {
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (goalsError) throw goalsError;

      const { data: reviews, error: reviewsError } = await supabase
        .from('goal_reviews')
        .select('*')
        .order('review_date', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Calculate pending reviews (goals where next review date is in the past or soon)
      const now = new Date();
      const twoWeeksFromNow = addDays(now, 14);

      return (goalsData || []).map(goal => {
        const goalReviews = (reviews || []).filter(r => r.goal_id === goal.id);
        const lastReview = goalReviews[0];
        
        // Default: next review is 30 days after creation or last review
        const nextReviewDate = lastReview?.next_review_date 
          || addDays(new Date(goal.created_at), 30).toISOString().split('T')[0];

        const previousProgress = lastReview?.new_progress;
        const progressChange = previousProgress !== undefined 
          ? (goal.progress || 0) - previousProgress 
          : undefined;

        return {
          ...goal,
          lastReviewDate: lastReview?.review_date,
          nextReviewDate,
          progressChange,
          isPending: isBefore(new Date(nextReviewDate), twoWeeksFromNow)
        };
      }).filter(goal => goal.isPending);
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Lade anstehende Reviews...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Anstehende Reviews</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Review durchführen
        </Button>
      </div>

      {goals.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Keine anstehenden Reviews.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map((goal: any) => (
            <PendingReviewCard
              key={goal.id}
              goalTitle={goal.title}
              ownerName={goal.owner_name || 'Kein Owner'}
              level={goal.level}
              progress={goal.progress || 0}
              lastReviewDate={goal.lastReviewDate}
              nextReviewDate={goal.nextReviewDate}
              progressChange={goal.progressChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
