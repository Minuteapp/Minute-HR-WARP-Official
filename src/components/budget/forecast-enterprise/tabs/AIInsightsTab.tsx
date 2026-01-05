import React from 'react';
import { AIOverallAssessment } from '../aiinsights/AIOverallAssessment';
import { AIFeatureCards } from '../aiinsights/AIFeatureCards';
import { InsightsList } from '../aiinsights/InsightsList';
import { AIScenarioSimulation } from '../aiinsights/AIScenarioSimulation';
import { OptimizationSuggestions } from '../aiinsights/OptimizationSuggestions';
import { BudgetRiskScoring } from '../aiinsights/BudgetRiskScoring';

export const AIInsightsTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">KI-Insights & Empfehlungen</h2>
        <p className="text-muted-foreground">
          Intelligente Analysen und Optimierungsvorschläge für Ihr Budget
        </p>
      </div>

      {/* AI Overall Assessment */}
      <AIOverallAssessment />

      {/* Feature Cards */}
      <AIFeatureCards />

      {/* Insights List */}
      <InsightsList />

      {/* Two Column Layout for Simulation and Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIScenarioSimulation />
        <OptimizationSuggestions />
      </div>

      {/* Budget Risk Scoring */}
      <BudgetRiskScoring />
    </div>
  );
};
