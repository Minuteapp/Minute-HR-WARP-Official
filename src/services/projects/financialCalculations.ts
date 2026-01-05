/**
 * Financial calculation service for projects
 * Handles ROI, NPV, IRR calculations
 */

export interface CashFlow {
  period: number;
  amount: number;
  date?: string;
}

export interface FinancialMetrics {
  roi: number;
  npv: number;
  irr: number;
  paybackPeriod: number;
  profitabilityIndex: number;
}

export interface ProjectFinancialData {
  initialInvestment: number;
  expectedRevenue: number;
  operatingCosts: number;
  cashFlows: CashFlow[];
  projectDuration: number; // in years
  discountRate?: number;
}

export class FinancialCalculationService {
  private static readonly DEFAULT_DISCOUNT_RATE = 0.10; // 10%

  /**
   * Calculate Return on Investment (ROI)
   */
  static calculateROI(initialInvestment: number, totalReturn: number): number {
    if (initialInvestment === 0) return 0;
    return ((totalReturn - initialInvestment) / initialInvestment) * 100;
  }

  /**
   * Calculate Net Present Value (NPV)
   */
  static calculateNPV(
    initialInvestment: number, 
    cashFlows: CashFlow[], 
    discountRate: number = this.DEFAULT_DISCOUNT_RATE
  ): number {
    let npv = -initialInvestment;
    
    cashFlows.forEach(cashFlow => {
      const presentValue = cashFlow.amount / Math.pow(1 + discountRate, cashFlow.period);
      npv += presentValue;
    });
    
    return npv;
  }

  /**
   * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
   */
  static calculateIRR(initialInvestment: number, cashFlows: CashFlow[]): number {
    const maxIterations = 100;
    const tolerance = 0.0001;
    let rate = 0.1; // Initial guess of 10%
    
    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(initialInvestment, cashFlows, rate);
      
      if (Math.abs(npv) < tolerance) {
        return rate * 100; // Return as percentage
      }
      
      // Calculate derivative for Newton-Raphson
      const derivative = cashFlows.reduce((sum, cashFlow) => {
        return sum - (cashFlow.period * cashFlow.amount) / Math.pow(1 + rate, cashFlow.period + 1);
      }, 0);
      
      if (Math.abs(derivative) < tolerance) break;
      
      rate = rate - npv / derivative;
      
      // Keep rate reasonable
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }
    
    return rate * 100;
  }

  /**
   * Calculate Payback Period
   */
  static calculatePaybackPeriod(initialInvestment: number, cashFlows: CashFlow[]): number {
    let cumulativeCashFlow = -initialInvestment;
    
    for (const cashFlow of cashFlows) {
      cumulativeCashFlow += cashFlow.amount;
      
      if (cumulativeCashFlow >= 0) {
        return cashFlow.period;
      }
    }
    
    return -1; // Never pays back
  }

  /**
   * Calculate Profitability Index
   */
  static calculateProfitabilityIndex(
    initialInvestment: number, 
    cashFlows: CashFlow[], 
    discountRate: number = this.DEFAULT_DISCOUNT_RATE
  ): number {
    if (initialInvestment === 0) return 0;
    
    const presentValueOfCashFlows = cashFlows.reduce((sum, cashFlow) => {
      return sum + (cashFlow.amount / Math.pow(1 + discountRate, cashFlow.period));
    }, 0);
    
    return presentValueOfCashFlows / initialInvestment;
  }

  /**
   * Calculate all financial metrics for a project
   */
  static calculateAllMetrics(projectData: ProjectFinancialData): FinancialMetrics {
    const { 
      initialInvestment, 
      expectedRevenue, 
      operatingCosts, 
      cashFlows, 
      discountRate = this.DEFAULT_DISCOUNT_RATE 
    } = projectData;

    const roi = this.calculateROI(initialInvestment, expectedRevenue - operatingCosts);
    const npv = this.calculateNPV(initialInvestment, cashFlows, discountRate);
    const irr = this.calculateIRR(initialInvestment, cashFlows);
    const paybackPeriod = this.calculatePaybackPeriod(initialInvestment, cashFlows);
    const profitabilityIndex = this.calculateProfitabilityIndex(initialInvestment, cashFlows, discountRate);

    return {
      roi,
      npv,
      irr,
      paybackPeriod,
      profitabilityIndex
    };
  }

  /**
   * Generate standard cash flow projection based on project data
   */
  static generateCashFlowProjection(projectData: ProjectFinancialData): CashFlow[] {
    const { expectedRevenue, operatingCosts, projectDuration } = projectData;
    const annualNetCashFlow = (expectedRevenue - operatingCosts) / projectDuration;
    
    const cashFlows: CashFlow[] = [];
    for (let year = 1; year <= projectDuration; year++) {
      cashFlows.push({
        period: year,
        amount: annualNetCashFlow
      });
    }
    
    return cashFlows;
  }

  /**
   * Categorize project investment type (CAPEX vs OPEX)
   */
  static categorizeInvestment(
    initialInvestment: number, 
    annualOperatingCosts: number, 
    projectDuration: number
  ): { type: 'CAPEX' | 'OPEX' | 'MIXED'; capexRatio: number; opexRatio: number } {
    const totalOpex = annualOperatingCosts * projectDuration;
    const totalInvestment = initialInvestment + totalOpex;
    
    const capexRatio = totalInvestment > 0 ? (initialInvestment / totalInvestment) * 100 : 0;
    const opexRatio = totalInvestment > 0 ? (totalOpex / totalInvestment) * 100 : 0;
    
    let type: 'CAPEX' | 'OPEX' | 'MIXED' = 'MIXED';
    
    if (capexRatio > 70) {
      type = 'CAPEX';
    } else if (opexRatio > 70) {
      type = 'OPEX';
    }
    
    return { type, capexRatio, opexRatio };
  }
}
