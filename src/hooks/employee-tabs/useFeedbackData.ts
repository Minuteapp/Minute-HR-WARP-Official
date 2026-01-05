import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFeedbackData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Feedback Reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["feedback-reviews", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("feedback_reviews")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Feedback Requests für ein Review
  const getFeedbackRequests = (reviewId: string) => {
    return useQuery({
      queryKey: ["feedback-requests", reviewId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("feedback_requests")
          .select("*, reviewer:employees!feedback_requests_reviewer_id_fkey(id, first_name, last_name, email)")
          .eq("review_id", reviewId);
        if (error) throw error;
        return data;
      },
      enabled: !!reviewId,
    });
  };

  // Start neues Review
  const startNewReview = useMutation({
    mutationFn: async (data: any) => {
      const { data: user } = await supabase.auth.getUser();
      const { data: review, error } = await supabase
        .from("feedback_reviews")
        .insert({
          employee_id: employeeId,
          created_by: user?.user?.id,
          ...data
        })
        .select()
        .single();
      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-reviews"] });
      toast({ title: "Feedback-Review gestartet" });
    },
  });

  // Add Feedback Request
  const addFeedbackRequest = useMutation({
    mutationFn: async ({ reviewId, reviewerId, reviewerType }: any) => {
      const { error } = await supabase
        .from("feedback_requests")
        .insert({
          review_id: reviewId,
          reviewer_id: reviewerId,
          reviewer_type: reviewerType,
          sent_date: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-requests"] });
      toast({ title: "Feedback-Anfrage versendet" });
    },
  });

  // Submit Feedback Response
  const submitFeedbackResponse = useMutation({
    mutationFn: async ({ requestId, responses }: any) => {
      // Insert multiple responses
      const { error } = await supabase
        .from("feedback_responses")
        .insert(
          responses.map((r: any) => ({
            request_id: requestId,
            ...r
          }))
        );
      if (error) throw error;

      // Update request status
      await supabase
        .from("feedback_requests")
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq("id", requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-requests"] });
      toast({ title: "Feedback eingereicht" });
    },
  });

  // Complete Review
  const completeReview = useMutation({
    mutationFn: async ({ reviewId, summary, developmentPlan, overallRating }: any) => {
      const { error } = await supabase
        .from("feedback_reviews")
        .update({
          status: 'completed',
          summary,
          development_plan: developmentPlan,
          overall_rating: overallRating,
          completed_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-reviews"] });
      toast({ title: "Review abgeschlossen" });
    },
  });

  return {
    reviews,
    isLoading: isLoadingReviews,
    getFeedbackRequests,
    startNewReview,
    addFeedbackRequest,
    submitFeedbackResponse,
    completeReview,
  };
};
