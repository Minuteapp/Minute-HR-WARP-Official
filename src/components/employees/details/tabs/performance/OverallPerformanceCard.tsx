import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface OverallPerformanceCardProps {
  reviews: any[];
}

export const OverallPerformanceCard = ({ reviews }: OverallPerformanceCardProps) => {
  const currentYear = 2025;
  const yearReviews = reviews.filter((r) => r.year === currentYear);
  
  const overallScore = yearReviews.length > 0
    ? yearReviews.reduce((sum, r) => sum + parseFloat(r.overall_score), 0) / yearReviews.length
    : 0;

  const q1 = yearReviews.find((r) => r.review_period === "Q1");
  const q2 = yearReviews.find((r) => r.review_period === "Q2");
  const q3 = yearReviews.find((r) => r.review_period === "Q3");
  const q4 = yearReviews.find((r) => r.review_period === "Q4");

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Performance Gesamtbewertung {currentYear}
          </CardTitle>
          <Badge className="bg-purple-600">⭐ Exceeds Expectations</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-purple-600 mb-2">
            {overallScore.toFixed(0)}%
          </div>
          <p className="text-sm text-muted-foreground">Top 15% im Unternehmen</p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold">Vierteljährliche Bewertungen</h4>
          
          {q1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Q1 {currentYear}</span>
                <span className="font-bold">{parseFloat(q1.overall_score).toFixed(0)}%</span>
              </div>
              <Progress value={parseFloat(q1.overall_score)} className="h-2" />
            </div>
          )}

          {q2 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Q2 {currentYear}</span>
                <span className="font-bold">{parseFloat(q2.overall_score).toFixed(0)}%</span>
              </div>
              <Progress value={parseFloat(q2.overall_score)} className="h-2" />
            </div>
          )}

          {q3 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Q3 {currentYear}</span>
                <span className="font-bold">{parseFloat(q3.overall_score).toFixed(0)}%</span>
              </div>
              <Progress value={parseFloat(q3.overall_score)} className="h-2" />
            </div>
          )}

          {q4 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Q4 {currentYear} (aktuell)</span>
                <span className="font-bold text-purple-600">{parseFloat(q4.overall_score).toFixed(0)}%</span>
              </div>
              <Progress value={parseFloat(q4.overall_score)} className="h-2 bg-purple-100" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
