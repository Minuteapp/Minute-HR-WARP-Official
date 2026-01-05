import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, DollarSign, Lightbulb } from 'lucide-react';

export const EnergyTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stromverbrauch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">1,245 kWh</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">-5% vs. letzter Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gasverbrauch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">892 m³</div>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500">+2% vs. letzter Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Energiekosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">€1,892</div>
              <DollarSign className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xs text-gray-500">-3% vs. letzter Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Effizienz-Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <Lightbulb className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">+12% vs. letzter Monat</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Energieverbrauch Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Energie-Dashboard</h3>
              <p className="text-slate-500">
                Interaktive Diagramme und Echtzeitdaten werden geladen...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};