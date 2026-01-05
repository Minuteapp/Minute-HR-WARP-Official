
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Feedback {
  id: string;
  stakeholder: string;
  comment: string;
  rating: 'positive' | 'neutral' | 'negative';
  date: string;
  resolved: boolean;
}

interface StakeholderFeedbackProps {
  projectId: string;
  projectName: string;
  isCompleted: boolean;
}

export const StakeholderFeedback: React.FC<StakeholderFeedbackProps> = ({ 
  projectId, 
  projectName, 
  isCompleted 
}) => {
  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      stakeholder: 'Max Mustermann (CEO)',
      comment: 'Sehr zufrieden mit dem Fortschritt. Die Lösung entspricht unseren Erwartungen.',
      rating: 'positive',
      date: '2024-01-20',
      resolved: true
    },
    {
      id: '2',
      stakeholder: 'Sarah Schmidt (Marketing)',
      comment: 'Die Benutzeroberfläche könnte noch intuitiver gestaltet werden.',
      rating: 'neutral',
      date: '2024-01-18',
      resolved: false
    }
  ]);

  const [newFeedback, setNewFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      console.log('Submitting feedback for project:', projectId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'positive':
        return 'Positiv';
      case 'negative':
        return 'Negativ';
      default:
        return 'Neutral';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Stakeholder-Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Noch kein Feedback vorhanden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRatingIcon(feedback.rating)}
                      <span className="font-medium text-sm">{feedback.stakeholder}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRatingColor(feedback.rating)}>
                        {getRatingLabel(feedback.rating)}
                      </Badge>
                      <span className="text-xs text-gray-500">{feedback.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.comment}</p>
                  {!feedback.resolved && (
                    <Badge variant="outline" className="mt-2">
                      Offen
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <Textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Neues Feedback hinzufügen..."
              rows={3}
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={!newFeedback.trim() || isSubmitting}
              size="sm"
              className="mt-2"
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Feedback hinzufügen'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
