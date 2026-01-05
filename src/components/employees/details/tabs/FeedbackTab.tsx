import { useFeedbackData } from "@/hooks/employee-tabs/useFeedbackData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Users, TrendingUp } from "lucide-react";
import { EditableField } from "../../shared/EditableField";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";

interface FeedbackTabProps extends EmployeeTabEditProps {}

export const FeedbackTab = ({ 
  employeeId,
  isEditing = false,
  onFieldChange,
  pendingChanges
}: FeedbackTabProps) => {
  const { reviews, isLoading, startNewReview } = useFeedbackData(employeeId);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const activeReview = reviews?.find(r => r.status === 'in_progress') || reviews?.[0];

  return (
    <div className="space-y-6">
      {/* Header mit Aktionen */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                360° Feedback
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Umfassendes Feedback von Kollegen, Vorgesetzten und direkten Mitarbeitern
              </p>
            </div>
            <Button 
              onClick={() => startNewReview.mutate({
                type: '360_feedback',
                status: 'in_progress',
                review_period: 'Q4 2025'
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Neues Review starten
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Aktuelles Review */}
      {activeReview ? (
        <>
          {/* Review Status */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle>Review Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <EditableField
                    label="Review-Typ"
                    value={pendingChanges?.feedback?.type ?? activeReview.type}
                    isEditing={isEditing}
                    onChange={(val) => onFieldChange?.('feedback', 'type', val)}
                    valueClassName="font-semibold"
                  />
                  <EditableField
                    label="Periode"
                    value={pendingChanges?.feedback?.review_period ?? activeReview.review_period}
                    isEditing={isEditing}
                    onChange={(val) => onFieldChange?.('feedback', 'review_period', val)}
                    valueClassName="text-sm text-muted-foreground"
                  />
                </div>
                <Badge variant={activeReview.status === 'completed' ? 'default' : 'secondary'}>
                  {activeReview.status === 'in_progress' ? 'In Bearbeitung' : 'Abgeschlossen'}
                </Badge>
              </div>
              {(activeReview.summary || isEditing) && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Zusammenfassung</h4>
                  <EditableField
                    value={pendingChanges?.feedback?.summary ?? activeReview.summary ?? ""}
                    isEditing={isEditing}
                    onChange={(val) => onFieldChange?.('feedback', 'summary', val)}
                    type="textarea"
                    placeholder="Zusammenfassung hinzufügen..."
                    valueClassName="text-sm"
                    showLabel={false}
                  />
                </div>
              )}
              {(activeReview.development_plan || isEditing) && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Entwicklungsplan</h4>
                  <EditableField
                    value={pendingChanges?.feedback?.development_plan ?? activeReview.development_plan ?? ""}
                    isEditing={isEditing}
                    onChange={(val) => onFieldChange?.('feedback', 'development_plan', val)}
                    type="textarea"
                    placeholder="Entwicklungsplan hinzufügen..."
                    valueClassName="text-sm"
                    showLabel={false}
                  />
                </div>
              )}
              {(activeReview.overall_rating || isEditing) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Gesamtbewertung</span>
                    <EditableField
                      value={pendingChanges?.feedback?.overall_rating ?? activeReview.overall_rating ?? 0}
                      isEditing={isEditing}
                      onChange={(val) => onFieldChange?.('feedback', 'overall_rating', val)}
                      type="number"
                      suffix="/5"
                      valueClassName="font-medium"
                      showLabel={false}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback-Anfragen */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Feedback-Anfragen
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Anfrage hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-6">
                Hier werden Feedback-Anfragen angezeigt, sobald welche gesendet wurden.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-primary/20 shadow-md">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Kein aktives Review</h3>
            <p className="text-muted-foreground mb-6">
              Starte ein neues 360° Feedback Review, um umfassendes Feedback zu sammeln.
            </p>
            <Button 
              onClick={() => startNewReview.mutate({
                type: '360_feedback',
                status: 'in_progress',
                review_period: 'Q4 2025'
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Neues Review starten
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vergangene Reviews */}
      {reviews && reviews.length > 0 && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vergangene Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <div 
                  key={review.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{review.type} - {review.review_period}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('de-DE')}
                      {review.completed_date && ` - ${new Date(review.completed_date).toLocaleDateString('de-DE')}`}
                    </p>
                  </div>
                  <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                    {review.status === 'in_progress' ? 'In Bearbeitung' : 'Abgeschlossen'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
