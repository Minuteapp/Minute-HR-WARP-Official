import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, TrendingDown, Heart, AlertTriangle, Activity } from 'lucide-react';
import { ESGKPICards, ESGKPIData } from './ESGKPICards';
import { ESGAICard } from './ESGAICard';
import { ESGGoalCard, ESGGoal } from './ESGGoalCard';
import { DiversityChart } from './DiversityChart';
import { GenderPayGapChart } from './GenderPayGapChart';
import { WellbeingTrendChart } from './WellbeingTrendChart';
import { SocialIndicatorCard } from './SocialIndicatorCard';
import { ESGDisclaimer } from './ESGDisclaimer';

interface SocialIndicator {
  id: string;
  icon: 'users' | 'trending-down' | 'heart' | 'activity' | 'alert-triangle';
  title: string;
  value: string | number;
  target: string;
  showWarning?: boolean;
}

interface ESGComplianceTabProps {
  kpiData?: ESGKPIData;
  aiAnalysisText?: string;
  aiRecommendations?: string[];
  goals?: ESGGoal[];
  diversityData?: { department: string; male: number; female: number }[];
  genderPayGapData?: { department: string; gap: number }[];
  genderPayGapTarget?: number;
  wellbeingData?: { month: string; sickDays: number; burnoutRisk: number }[];
  socialIndicators?: SocialIndicator[];
  disclaimerText?: string;
}

const iconMap = {
  'users': Users,
  'trending-down': TrendingDown,
  'heart': Heart,
  'activity': Activity,
  'alert-triangle': AlertTriangle,
};

export const ESGComplianceTab: React.FC<ESGComplianceTabProps> = ({
  kpiData,
  aiAnalysisText,
  aiRecommendations,
  goals,
  diversityData,
  genderPayGapData,
  genderPayGapTarget,
  wellbeingData,
  socialIndicators,
  disclaimerText
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">ESG & Social Compliance</h2>
        <p className="text-sm text-muted-foreground">Umwelt-, Sozial- und Governance-Compliance</p>
      </div>

      {/* KPI Cards */}
      <ESGKPICards data={kpiData} />

      {/* AI Analysis Card */}
      <ESGAICard 
        analysisText={aiAnalysisText}
        recommendations={aiRecommendations}
      />

      {/* ESG Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ESG-Ziele & Fortschritt</h3>
        
        {goals && goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map(goal => (
              <ESGGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Keine ESG-Ziele definiert.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiversityChart data={diversityData} />
        <GenderPayGapChart data={genderPayGapData} targetMax={genderPayGapTarget} />
      </div>

      {/* Wellbeing Trend Chart */}
      <WellbeingTrendChart data={wellbeingData} />

      {/* Social Compliance Indicators */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Compliance Indikatoren</h3>
        
        {socialIndicators && socialIndicators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialIndicators.map(indicator => {
              const IconComponent = iconMap[indicator.icon] || Users;
              return (
                <SocialIndicatorCard
                  key={indicator.id}
                  icon={IconComponent}
                  title={indicator.title}
                  value={indicator.value}
                  target={indicator.target}
                  showWarning={indicator.showWarning}
                  iconBg={indicator.showWarning ? 'bg-orange-100 dark:bg-orange-950/30' : 'bg-muted'}
                  iconColor={indicator.showWarning ? 'text-orange-600' : 'text-muted-foreground'}
                />
              );
            })}
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Keine Indikatoren vorhanden</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Social Compliance Indikatoren werden hier angezeigt, sobald entsprechende Daten vorliegen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disclaimer */}
      <ESGDisclaimer text={disclaimerText} />
    </div>
  );
};
