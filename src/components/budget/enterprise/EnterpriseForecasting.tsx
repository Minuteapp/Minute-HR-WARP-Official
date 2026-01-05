
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Brain, AlertCircle } from "lucide-react";
import { useEnterpriseForecasts } from '@/hooks/useBudgetEnterprise';
import { CreateEnterpriseForecastDialog } from './CreateEnterpriseForecastDialog';

export const EnterpriseForecasting = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Entferne das Argument, da der Hook keine Parameter erwartet
  const { data: forecasts, isLoading, error } = useEnterpriseForecasts();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Fehler beim Laden der Prognosen</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Forecasting</h1>
          <p className="text-gray-600 mt-2">Erweiterte Prognoseerstellung und -analyse</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Prognose
        </Button>
      </div>

      {/* Prognose-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forecasts && forecasts.length > 0 ? (
          forecasts.map((forecast) => (
            <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{forecast.forecast_name}</span>
                  <div className="flex items-center text-sm text-gray-500">
                    {forecast.forecast_type === 'ml_trend' && <Brain className="h-4 w-4 mr-1" />}
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Typ:</span>
                    <span className="capitalize">{forecast.forecast_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Szenario:</span>
                    <span className="capitalize">{forecast.scenario_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`capitalize ${
                      forecast.status === 'active' ? 'text-green-600' : 
                      forecast.status === 'draft' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {forecast.status}
                    </span>
                  </div>
                  {forecast.description && (
                    <p className="text-sm text-gray-600 mt-2">{forecast.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Noch keine Enterprise Prognosen erstellt</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Prognose erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog für neue Prognose */}
      <CreateEnterpriseForecastDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default EnterpriseForecasting;
