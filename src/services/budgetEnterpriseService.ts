
import { forecastService } from './budget/forecastService';
import { dimensionService } from './budget/dimensionService';
import { approvalService } from './budget/approvalService';
import { aiInsightsService } from './budget/aiInsightsService';
import { exportService } from './budget/exportService';
import { integrationService } from './budget/integrationService';
import { permissionService } from './budget/permissionService';

export const budgetEnterpriseService = {
  ...forecastService,
  ...dimensionService,
  ...approvalService,
  ...aiInsightsService,
  ...exportService,
  ...integrationService,
  ...permissionService,

  // Zusätzliche Enterprise-spezifische Methoden
  async getBudgetDimensions() {
    // Simuliere Budget-Dimensionen
    return [
      { id: '1', name: 'Abteilung', type: 'department', values: ['IT', 'Marketing', 'Verwaltung'] },
      { id: '2', name: 'Projekt', type: 'project', values: ['Projekt A', 'Projekt B', 'Projekt C'] },
      { id: '3', name: 'Kostenstelle', type: 'cost_center', values: ['1000', '2000', '3000'] },
      { id: '4', name: 'Produkt', type: 'product', values: ['Produkt X', 'Produkt Y', 'Produkt Z'] }
    ];
  }
};
