import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

interface GoalsKPICardsProps {
  total: number;
  completed: number;
  onTrack: number;
  atRisk: number;
}

export const GoalsKPICards = ({
  total,
  completed,
  onTrack,
  atRisk
}: GoalsKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{onTrack}</p>
              <p className="text-sm text-muted-foreground">Im Plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{atRisk}</p>
              <p className="text-sm text-muted-foreground">Gefährdet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
