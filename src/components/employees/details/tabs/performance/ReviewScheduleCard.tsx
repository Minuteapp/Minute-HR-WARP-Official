import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const ReviewScheduleCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Review-Termine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Keine Review-Termine geplant</p>
          <p className="text-xs text-muted-foreground">
            Review-Termine werden vom Management oder HR erstellt und hier angezeigt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
