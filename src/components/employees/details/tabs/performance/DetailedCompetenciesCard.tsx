import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export const DetailedCompetenciesCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Detaillierte Kompetenzbewertung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Keine Kompetenzbewertungen vorhanden</p>
          <p className="text-xs text-muted-foreground">
            Kompetenzbewertungen werden nach Performance-Reviews hier angezeigt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
