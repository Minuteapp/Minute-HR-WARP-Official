
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  Calendar, 
  Users, 
  BarChart3,
  Settings,
  Clock,
  Shuffle
} from 'lucide-react';
import ProjectRequirementsOptimizer from './ProjectRequirementsOptimizer';
import AbsenceIntegrationManager from './AbsenceIntegrationManager';
import ShiftSwapSuggestions from './ShiftSwapSuggestions';
import WorkloadBalancer from './WorkloadBalancer';

const IntelligentShiftManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('project-requirements');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleGlobalOptimization = async () => {
    setIsOptimizing(true);
    // Simuliere globale Optimierung
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Intelligente Schichtplanung
          </h2>
          <p className="text-gray-600">KI-gestützte Optimierung und automatische Anpassungen</p>
        </div>
        <Button 
          onClick={handleGlobalOptimization}
          disabled={isOptimizing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isOptimizing ? (
            <>
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              Optimiere...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Globale Optimierung
            </>
          )}
        </Button>
      </div>

      {/* Übersichts-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Projekt-Abdeckung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <p className="text-xs text-gray-600">Durchschnittlich optimal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              Abwesenheiten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <p className="text-xs text-gray-600">Automatisch berücksichtigt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-blue-600" />
              Tausch-Vorschläge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <p className="text-xs text-gray-600">Pending Swaps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Arbeitsbelastung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Balanced</div>
            <p className="text-xs text-gray-600">Optimal verteilt</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligente Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="project-requirements" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Projekt-Anforderungen
          </TabsTrigger>
          <TabsTrigger value="absence-integration" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Abwesenheits-Integration
          </TabsTrigger>
          <TabsTrigger value="shift-swaps" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Schicht-Tausch
          </TabsTrigger>
          <TabsTrigger value="workload-balance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Arbeitsbelastung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project-requirements" className="mt-6">
          <ProjectRequirementsOptimizer />
        </TabsContent>

        <TabsContent value="absence-integration" className="mt-6">
          <AbsenceIntegrationManager />
        </TabsContent>

        <TabsContent value="shift-swaps" className="mt-6">
          <ShiftSwapSuggestions />
        </TabsContent>

        <TabsContent value="workload-balance" className="mt-6">
          <WorkloadBalancer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentShiftManager;
