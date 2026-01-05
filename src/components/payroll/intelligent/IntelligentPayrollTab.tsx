
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Calculator, TrendingUp, Clock } from 'lucide-react';
import AIBonusCalculations from './AIBonusCalculations';
import BudgetMonitoring from './BudgetMonitoring';
import PerformanceSalaryAnalysis from './PerformanceSalaryAnalysis';
import TimeTrackingIntegration from './TimeTrackingIntegration';

const IntelligentPayrollTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bonus');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Intelligente Gehalts-Features</h2>
        <p className="text-gray-600">
          KI-gestützte Funktionen für optimale Gehaltsabrechnung und Finanzmanagement
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bonus" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Bonus-KI
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Budget-Monitor
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Gehalts-Analyse
          </TabsTrigger>
          <TabsTrigger value="timetracking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Zeit-Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bonus" className="space-y-4">
          <AIBonusCalculations />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetMonitoring />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceSalaryAnalysis />
        </TabsContent>

        <TabsContent value="timetracking" className="space-y-4">
          <TimeTrackingIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentPayrollTab;
