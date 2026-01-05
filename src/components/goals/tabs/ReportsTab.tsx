import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const ReportsTab = () => {
  return (
    <div className="h-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Berichte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics & Berichte</h3>
              <p className="text-slate-500">
                Fortschritts- und Performance-Berichte werden implementiert...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};