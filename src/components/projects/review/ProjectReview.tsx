
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ProjectReviewProps {
  projectId: string;
  isCompleted: boolean;
}

export const ProjectReview: React.FC<ProjectReviewProps> = ({ projectId, isCompleted }) => {
  const [review, setReview] = useState({
    rating: 0,
    comment: '',
    submitted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (rating: number) => {
    setReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (review.rating === 0) return;
    
    setIsSubmitting(true);
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReview(prev => ({ ...prev, submitted: true }));
    } catch (error) {
      console.error('Fehler beim Speichern der Bewertung:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Projekt-Bewertung
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isCompleted ? (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Bewertung verfügbar nach Projektabschluss</p>
          </div>
        ) : review.submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-green-600 font-medium">Bewertung abgegeben</p>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {review.comment && (
              <p className="text-sm text-gray-600 mt-2 italic">"{review.comment}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bewertung</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kommentar (optional)</label>
              <Textarea
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Ihre Bewertung des Projekts..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={review.rating === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Bewertung abgeben'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
