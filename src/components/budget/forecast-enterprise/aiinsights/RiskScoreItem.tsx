import React from 'react';
import { RiskLevelBadge } from './RiskLevelBadge';

interface RiskScoreItemProps {
  costCenterName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskDescription: string;
}

export const RiskScoreItem: React.FC<RiskScoreItemProps> = ({
  costCenterName,
  riskScore,
  riskLevel,
  riskDescription
}) => {
  const getScoreColor = () => {
    if (riskScore >= 70) return 'text-red-600 bg-red-100';
    if (riskScore >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
      <div className={`h-14 w-14 rounded-full flex items-center justify-center ${getScoreColor()}`}>
        <span className="text-xl font-bold">{riskScore}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground">{costCenterName}</h4>
          <RiskLevelBadge level={riskLevel} />
        </div>
        <p className="text-sm text-muted-foreground">{riskDescription}</p>
      </div>
    </div>
  );
};
