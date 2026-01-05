import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Calendar, CheckCircle } from 'lucide-react';

export const ReportsTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nachhaltigkeitsberichte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Sustainability Reports</h3>
              <p className="text-slate-500">
                Automatisierte Berichtserstellung und ESG-Compliance werden implementiert...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};