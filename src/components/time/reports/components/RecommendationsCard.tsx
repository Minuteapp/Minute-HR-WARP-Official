import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recommendation } from '@/utils/workPatternRecommendations';
import { Info } from "lucide-react";

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

// Farben für nummerierte Kreise
const numberColors = [
  'bg-indigo-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
];

const RecommendationsCard = ({ recommendations }: RecommendationsCardProps) => {
  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Empfehlungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className={`w-7 h-7 rounded-full ${numberColors[index % numberColors.length]} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-sm font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="font-semibold text-sm text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{rec.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Info className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-500">
              Erfassen Sie mehr Arbeitszeiten, um personalisierte Empfehlungen zu erhalten.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;