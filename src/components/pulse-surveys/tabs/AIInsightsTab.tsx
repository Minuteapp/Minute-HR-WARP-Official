import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AIInsightsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KI-Erkenntnisse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            KI-generierte Insights werden hier angezeigt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
