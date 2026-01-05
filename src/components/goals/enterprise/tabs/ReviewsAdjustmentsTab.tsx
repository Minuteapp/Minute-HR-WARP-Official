import { ReviewsHeader } from "../reviews/ReviewsHeader";
import { PendingReviewsList } from "../reviews/PendingReviewsList";
import { ReviewHistoryList } from "../reviews/ReviewHistoryList";
import { ReviewPrinciplesBox } from "../reviews/ReviewPrinciplesBox";

export const ReviewsAdjustmentsTab = () => {
  return (
    <div className="space-y-6">
      <ReviewsHeader />
      
      <PendingReviewsList />

      <ReviewHistoryList />

      <ReviewPrinciplesBox />
    </div>
  );
};
