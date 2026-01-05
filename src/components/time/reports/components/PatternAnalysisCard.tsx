import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Building2 } from "lucide-react";

interface PatternAnalysisCardProps {
  mostProductiveDay: { day: string; hours: number };
  mostCommonStartTime: { time: string; percentage: number };
  mainProject: { name: string; hours: number };
}

const PatternAnalysisCard = ({
  mostProductiveDay,
  mostCommonStartTime,
  mainProject
}: PatternAnalysisCardProps) => {
  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Arbeitsmuster-Analyse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Produktivster Tag */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Produktivster Tag</span>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {mostProductiveDay.day}
            </p>
            <p className="text-sm text-gray-500">
              {mostProductiveDay.hours} Stunden durchschnittlich
            </p>
          </div>
        </div>

        {/* Häufigste Startzeit */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Häufigste Startzeit</span>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {mostCommonStartTime.time}
            </p>
            <p className="text-sm text-gray-500">
              {mostCommonStartTime.percentage}% Ihrer Arbeitstage
            </p>
          </div>
        </div>

        {/* Hauptprojekt */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hauptprojekt</span>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {mainProject.name}
            </p>
            <p className="text-sm text-gray-500">
              {mainProject.hours} Stunden im Monat
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternAnalysisCard;