
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route, Target, Clock, TrendingUp } from 'lucide-react';
import RouteOptimizer from './RouteOptimizer';
import BudgetMonitor from './BudgetMonitor';
import AutoTimeTracking from './AutoTimeTracking';
import { BusinessTrip } from '@/types/business-travel';

interface IntelligentFeaturesTabProps {
  trip?: BusinessTrip;
}

const IntelligentFeaturesTab: React.FC<IntelligentFeaturesTabProps> = ({ trip }) => {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Intelligente Features</h2>
        <p className="text-gray-600">
          KI-gestützte Funktionen für optimale Reiseplanung und -verwaltung
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Routen-Optimierung
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget-Monitor
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Zeiterfassung
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Kostenanalyse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <RouteOptimizer />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetMonitor tripId={trip?.id} />
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          {trip ? (
            <AutoTimeTracking trip={trip} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Wählen Sie eine Reise aus, um die Zeiterfassung zu verwenden</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Kostenanalyse wird bald verfügbar sein</p>
            <p className="text-sm">KI-basierte Ausgabenanalyse und Optimierungsvorschläge</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentFeaturesTab;
