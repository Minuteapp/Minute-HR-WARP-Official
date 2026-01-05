import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface FeedbackSource {
  status: string;
  completed_at?: string;
  due_date?: string;
  scheduled_date?: string;
  rating?: number;
  reviewer_name?: string;
  count?: number;
}

interface FeedbackSourcesListProps {
  sources: {
    self?: FeedbackSource;
    manager?: FeedbackSource;
    peers?: FeedbackSource;
    directs?: FeedbackSource;
    final_meeting?: FeedbackSource;
  };
}

export const FeedbackSourcesList = ({ sources }: FeedbackSourcesListProps) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}>
            ★
          </span>
        ))}
        <span className="ml-1 text-sm font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const feedbackItems = [
    {
      title: "Selbsteinschätzung",
      source: sources.self,
      icon: "user",
    },
    {
      title: "Vorgesetzter",
      source: sources.manager,
      icon: "briefcase",
      subtitle: sources.manager?.reviewer_name,
    },
    {
      title: "Peer Review",
      source: sources.peers,
      icon: "users",
      subtitle: sources.peers?.count ? `${sources.peers.count} Kollegen` : undefined,
    },
    {
      title: "Direkt Unterstellte",
      source: sources.directs,
      icon: "users",
      subtitle: sources.directs?.count ? `${sources.directs.count} Mitarbeiter` : undefined,
    },
    {
      title: "Abschluss-Gespräch",
      source: sources.final_meeting,
      icon: "calendar",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          360° Feedback-Quellen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {feedbackItems.map((item, index) => {
            if (!item.source) return null;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {renderStatusIcon(item.source.status)}
                  <div>
                    <div className="font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.source.status === 'completed' && item.source.completed_at && (
                        <>Abgeschlossen: {format(new Date(item.source.completed_at), 'dd.MM.yyyy', { locale: de })}</>
                      )}
                      {item.source.status === 'pending' && item.source.due_date && (
                        <>Fällig: {format(new Date(item.source.due_date), 'dd.MM.yyyy', { locale: de })}</>
                      )}
                      {item.source.status === 'scheduled' && item.source.scheduled_date && (
                        <>Geplant: {format(new Date(item.source.scheduled_date), 'dd.MM.yyyy', { locale: de })}</>
                      )}
                    </div>
                  </div>
                </div>
                
                {item.source.status === 'completed' && item.source.rating && (
                  <div>{renderStars(item.source.rating)}</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
