import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Shield, Star } from 'lucide-react';

export const SupplyChainTab = () => {
  return (
    <div className="h-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Nachhaltige Lieferkette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Truck className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Supply Chain Management</h3>
              <p className="text-slate-500">
                Lieferanten-Bewertung und Nachhaltigkeits-Tracking werden implementiert...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};