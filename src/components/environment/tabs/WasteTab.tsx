import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recycle, Trash2, Package, TrendingUp } from 'lucide-react';

export const WasteTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gesamtabfall</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">148 kg</div>
              <Trash2 className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-xs text-gray-500">Diesen Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recycling Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <Recycle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">+5% vs. letzter Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wertstoffe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">132 kg</div>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Getrennt gesammelt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Abfall-Reduktion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">-23%</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">vs. Vorjahr</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            Abfallmanagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Recycle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Waste Management Dashboard</h3>
              <p className="text-slate-500">
                Abfall-Tracking und Recycling-Statistiken werden geladen...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};