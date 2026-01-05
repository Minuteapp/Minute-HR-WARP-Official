import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export const CalendarInsightsPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Kalender-Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <div className="text-center">
            <Brain className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600">AI-Insights werden geladen...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};