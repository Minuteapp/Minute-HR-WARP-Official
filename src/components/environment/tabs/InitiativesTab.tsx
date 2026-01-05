import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, CheckCircle, Clock } from 'lucide-react';

export const InitiativesTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Grüne Initiativen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-green-50 to-lime-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Green Initiatives</h3>
              <p className="text-slate-500">
                Nachhaltigkeits-Initiativen und Projekte werden implementiert...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};