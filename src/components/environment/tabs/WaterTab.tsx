import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, TrendingDown, Gauge, Beaker } from 'lucide-react';

export const WaterTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wasserverbrauch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">2,845 L</div>
              <Droplets className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Diesen Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Einsparung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">-18%</div>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">vs. letztes Jahr</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Effizienz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <Gauge className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Wasser-Effizienz</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Qualität</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">A+</div>
              <Beaker className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Wasserqualität</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Wasserverbrauch Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Droplets className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Water Management Dashboard</h3>
              <p className="text-slate-500">
                Wasserverbrauch-Tracking und Qualitätsmonitoring werden geladen...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};