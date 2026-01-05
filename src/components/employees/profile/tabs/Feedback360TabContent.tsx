import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFeedbackData } from '@/hooks/employee-tabs/useFeedbackData';
import { MessageSquare, Star, TrendingUp, Calendar } from 'lucide-react';

interface Feedback360TabContentProps {
  employeeId: string;
}

export const Feedback360TabContent: React.FC<Feedback360TabContentProps> = ({ employeeId }) => {
  const { reviews, isLoading } = useFeedbackData(employeeId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Feedback-Daten...</div>;
  }

  const completedReviews = reviews?.filter(r => r.status === 'completed') || [];
  const activeReviews = reviews?.filter(r => r.status === 'in_progress') || [];
  
  const averageRating = completedReviews.length > 0
    ? completedReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / completedReviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Gesamtbewertung */}
      {completedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Gesamtbewertung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex-1">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Basierend auf {completedReviews.length} abgeschlossenen Reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aktive Feedback-Runden */}
      {activeReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aktive Feedback-Runden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeReviews.map((review) => (
                <div key={review.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{review.review_cycle || '360° Feedback'}</h4>
                    <Badge variant="secondary">In Arbeit</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gestartet: {new Date(review.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review-Historie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review-Historie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{review.review_cycle || '360° Feedback'}</h4>
                        <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                          {review.status === 'completed' ? 'Abgeschlossen' : 
                           review.status === 'in_progress' ? 'In Arbeit' : 'Geplant'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(review.created_at).toLocaleDateString('de-DE')}
                        </div>
                        {review.overall_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {review.overall_rating}/5
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {review.summary && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Zusammenfassung</h5>
                      <p className="text-sm text-muted-foreground">{review.summary}</p>
                    </div>
                  )}
                  
                  {review.development_plan && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Entwicklungsplan</h5>
                      <p className="text-sm text-muted-foreground">{review.development_plan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Feedback-Reviews durchgeführt</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
