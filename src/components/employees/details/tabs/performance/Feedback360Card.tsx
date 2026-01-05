import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Feedback360CardProps {
  feedback360: any;
}

export const Feedback360Card = ({ feedback360 }: Feedback360CardProps) => {
  if (!feedback360) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            360-Grad-Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Kein 360-Grad-Feedback verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { subject: "Leadership", value: parseFloat(feedback360.leadership_score || 0) },
    { subject: "Kommunikation", value: parseFloat(feedback360.communication_score || 0) },
    { subject: "Fachkompetenz", value: parseFloat(feedback360.domain_expertise_score || 0) },
    { subject: "Innovation", value: parseFloat(feedback360.innovation_score || 0) },
    { subject: "Teamwork", value: parseFloat(feedback360.teamwork_score || 0) },
    { subject: "Problemlösung", value: parseFloat(feedback360.problem_solving_score || 0) },
  ];

  const feedbackSummary = feedback360.feedback_summary || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          360-Grad-Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Feedbackgeber</div>
            <div className="font-bold text-2xl">{feedback360.num_feedback_providers} Personen</div>
            <div className="text-xs text-muted-foreground mt-1">
              {feedbackSummary.manager || 0} Manager, {feedbackSummary.peers || 0} Peers, {feedbackSummary.reports || 0} Reports
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Letztes Feedback</div>
            <div className="font-semibold">
              {feedback360.last_feedback_date
                ? format(new Date(feedback360.last_feedback_date), "MMMM yyyy", { locale: de })
                : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{feedback360.feedback_period}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
