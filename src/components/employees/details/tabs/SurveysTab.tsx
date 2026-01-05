import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, ClipboardList } from 'lucide-react';

interface SurveysTabProps {
  employee: any;
}

export const SurveysTab: React.FC<SurveysTabProps> = ({ employee }) => {
  return (
    <div className="space-y-6">
      {/* Statistik-Karten - alle mit 0 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Aktive Umfragen</p>
                <p className="text-3xl font-bold text-blue-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Ø Teilnahme</p>
                <p className="text-3xl font-bold text-green-900">–</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Antworten</p>
                <p className="text-3xl font-bold text-purple-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Ø Zufriedenheit</p>
                <p className="text-3xl font-bold text-orange-900">–</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keine Umfragen vorhanden */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Umfragen vorhanden</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Für diesen Mitarbeiter liegen noch keine Umfragen vor. 
              Umfragen werden vom HR-Team erstellt und zugewiesen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
