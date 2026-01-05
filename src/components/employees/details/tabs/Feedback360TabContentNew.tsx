import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeedbackData } from '@/hooks/employee-tabs/useFeedbackData';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Feedback360Dialog } from '../dialogs/Feedback360Dialog';
import { Users, Plus, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface Feedback360TabContentNewProps {
  employeeId: string;
}

export const Feedback360TabContentNew: React.FC<Feedback360TabContentNewProps> = ({ employeeId }) => {
  const { reviews, isLoading, startNewReview } = useFeedbackData(employeeId);
  const { canCreate } = useEnterprisePermissions();
  
  const [dialogOpen, setDialogOpen] = useState(false);

  // Statistiken aus reviews berechnen
  const completedReviews = reviews?.filter(r => r.status === 'completed') || [];
  const pendingReviews = reviews?.filter(r => r.status === 'pending' || r.status === 'in_progress') || [];
  const avgRating = completedReviews.length > 0
    ? completedReviews.filter(r => r.overall_rating).reduce((sum, r) => sum + (r.overall_rating || 0), 0) / completedReviews.filter(r => r.overall_rating).length
    : 0;

  const statistics = {
    totalRequests: reviews?.length || 0,
    completed: completedReviews.length,
    pending: pendingReviews.length,
    avgRating
  };

  const feedbackRequests = pendingReviews;
  const receivedFeedback = completedReviews;

  const handleCreate = async (data: any) => {
    startNewReview.mutate(data);
  };

  const openCreateDialog = () => {
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Feedback-Daten...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'peer': 'Peer',
      'manager': 'Vorgesetzter',
      'direct_report': 'Mitarbeiter',
      'self': 'Selbst',
      'external': 'Extern',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          360° Feedback
        </h2>
        {canCreate('employee_feedback') && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Feedback anfordern
          </Button>
        )}
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics?.totalRequests || 0}</p>
              <p className="text-xs text-muted-foreground">Anfragen gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics?.completed || 0}</p>
              <p className="text-xs text-muted-foreground">Abgeschlossen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{statistics?.pending || 0}</p>
              <p className="text-xs text-muted-foreground">Ausstehend</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <p className="text-2xl font-bold">{statistics?.avgRating?.toFixed(1) || '-'}</p>
              </div>
              <p className="text-xs text-muted-foreground">Ø Bewertung</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offene Feedback-Anfragen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Offene Feedback-Anfragen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackRequests && feedbackRequests.length > 0 ? (
            <div className="space-y-3">
              {feedbackRequests.map((request: any) => (
                <div key={request.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.reviewer_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getFeedbackTypeLabel(request.feedback_type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fällig: {new Date(request.due_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                    {request.status === 'completed' ? 'Erhalten' : 'Ausstehend'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Feedback-Anfragen vorhanden</p>
              {canCreate('employee_feedback') && (
                <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Feedback anfordern
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Erhaltenes Feedback */}
      {receivedFeedback && receivedFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Erhaltenes Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivedFeedback.map((feedback: any) => (
                <div key={feedback.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{feedback.reviewer_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getFeedbackTypeLabel(feedback.feedback_type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Erhalten am: {new Date(feedback.completed_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    {feedback.overall_rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-4 w-4 ${i < feedback.overall_rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {feedback.comments && (
                    <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Feedback360Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        mode="create"
      />
    </div>
  );
};
