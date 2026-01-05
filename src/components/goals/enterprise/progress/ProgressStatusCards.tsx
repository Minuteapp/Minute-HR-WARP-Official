import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock, TrendingDown } from "lucide-react";

interface ProgressStatusCardsProps {
  onTrackCount: number;
  atRiskCount: number;
  delayedCount: number;
  averageDeviation: number;
}

export const ProgressStatusCards = ({ 
  onTrackCount, 
  atRiskCount, 
  delayedCount, 
  averageDeviation 
}: ProgressStatusCardsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{onTrackCount}</p>
              <p className="text-sm text-green-600">Im Plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{atRiskCount}</p>
              <p className="text-sm text-orange-600">Risiko</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{delayedCount}</p>
              <p className="text-sm text-red-600">Verzögert</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{averageDeviation}%</p>
              <p className="text-sm text-gray-600">Ø Abweichung</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
