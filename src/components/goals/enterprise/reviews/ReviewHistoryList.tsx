import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewHistoryCard } from "./ReviewHistoryCard";

export const ReviewHistoryList = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['goal-reviews-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_reviews')
        .select(`
          *,
          goal:goals(id, title)
        `)
        .order('review_date', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Lade Review-Historie...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Review-Historie</h3>
        <p className="text-sm text-muted-foreground">
          Vollständige Nachvollziehbarkeit aller Zielanpassungen und Begründungen
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Keine Reviews vorhanden.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => (
            <ReviewHistoryCard
              key={review.id}
              goalTitle={review.goal?.title || 'Unbekanntes Ziel'}
              reviewDate={review.review_date}
              nextReviewDate={review.next_review_date}
              previousProgress={review.previous_progress || 0}
              newProgress={review.new_progress || 0}
              reviewerName={review.reviewer_name}
              adjustments={review.adjustments}
              comments={review.comments}
            />
          ))}
        </div>
      )}
    </div>
  );
};
