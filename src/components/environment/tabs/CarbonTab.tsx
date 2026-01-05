import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, TrendingDown, Target, Award } from 'lucide-react';

export const CarbonTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CO2-Emissionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">2.4 t</div>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">-15% vs. letztes Jahr</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ziel Erreichung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">78%</div>
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Klimaneutralität 2030</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kompensation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">1.8 t</div>
              <Leaf className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">CO2 kompensiert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Zertifikat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gold-600">ISO 14001</div>
              <Award className="h-4 w-4 text-gold-600" />
            </div>
            <p className="text-xs text-gray-500">Gültig bis 2025</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            CO2-Bilanz Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Leaf className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Carbon Footprint Dashboard</h3>
              <p className="text-slate-500">
                Detaillierte CO2-Bilanz und Scope 1-3 Emissionen werden geladen...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};