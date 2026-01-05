import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from 'lucide-react';

export const GoalsBoardTab = () => {
  return (
    <div className="h-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Ziele Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
            <div className="text-center">
              <Layout className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Board Ansicht</h3>
              <p className="text-slate-500">
                Kanban-Board für Ziele wird implementiert...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};