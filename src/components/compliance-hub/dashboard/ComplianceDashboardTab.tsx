// Compliance Hub - Dashboard Tab (Haupt-Inhalt)
import React from 'react';
import { AIComplianceAnalysisCard, AIAnalysisData } from './AIComplianceAnalysisCard';
import { ComplianceKPICards, ComplianceKPIData } from './ComplianceKPICards';
import { ViolationsByLocationChart, ViolationsByLocationData } from './ViolationsByLocationChart';
import { RiskDistributionChart, RiskDistributionData } from './RiskDistributionChart';
import { ComplianceTrendChart, ComplianceTrendData } from './ComplianceTrendChart';
import { RecentActivitiesList, ActivityItem } from './RecentActivitiesList';

interface ComplianceDashboardTabProps {
  aiAnalysis?: AIAnalysisData;
  kpiData?: ComplianceKPIData;
  violationsByLocation?: ViolationsByLocationData[];
  riskDistribution?: RiskDistributionData[];
  trendData?: ComplianceTrendData[];
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export const ComplianceDashboardTab: React.FC<ComplianceDashboardTabProps> = ({
  aiAnalysis,
  kpiData,
  violationsByLocation,
  riskDistribution,
  trendData,
  activities,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      {/* KI-gestützte Analyse Card */}
      <AIComplianceAnalysisCard data={aiAnalysis} isLoading={isLoading} />
      
      {/* 6 KPI-Karten */}
      <ComplianceKPICards data={kpiData} isLoading={isLoading} />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ViolationsByLocationChart data={violationsByLocation} isLoading={isLoading} />
        <RiskDistributionChart data={riskDistribution} isLoading={isLoading} />
        <ComplianceTrendChart data={trendData} isLoading={isLoading} />
      </div>
      
      {/* Aktuelle Aktivitäten */}
      <RecentActivitiesList activities={activities} isLoading={isLoading} />
    </div>
  );
};
