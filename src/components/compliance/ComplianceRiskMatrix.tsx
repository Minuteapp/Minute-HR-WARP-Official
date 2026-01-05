
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComplianceRisks } from '@/hooks/useCompliance';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComplianceRiskMatrixProps {
  detailed?: boolean;
}

export const ComplianceRiskMatrix = ({ detailed = false }: ComplianceRiskMatrixProps) => {
  const { data: risks, isLoading } = useComplianceRisks();

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-100 rounded animate-pulse" />
    );
  }

  // Gruppiere Risiken nach Score für Matrix-Darstellung
  const riskMatrix = Array.from({ length: 5 }, (_, impact) =>
    Array.from({ length: 5 }, (_, likelihood) => {
      const score = (likelihood + 1) * (impact + 1);
      return risks?.filter(risk => risk.risk_score === score) || [];
    })
  );

  const getRiskColor = (score: number) => {
    if (score >= 20) return 'bg-red-500';
    if (score >= 15) return 'bg-orange-500';
    if (score >= 10) return 'bg-yellow-500';
    if (score >= 5) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 20) return 'Kritisch';
    if (score >= 15) return 'Hoch';
    if (score >= 10) return 'Mittel';
    if (score >= 5) return 'Niedrig';
    return 'Minimal';
  };

  if (detailed) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Risiko-Matrix</CardTitle>
            <CardDescription>
              Risiken nach Eintrittswahrscheinlichkeit und Auswirkung kategorisiert
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Risiko-Matrix Grid */}
            <div className="mb-6">
              <div className="grid grid-cols-6 gap-2 text-sm">
                {/* Header */}
                <div></div>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="text-center font-medium p-2">
                    {i + 1}
                  </div>
                ))}
                
                {/* Matrix Zellen */}
                {Array.from({ length: 5 }, (_, impact) => (
                  <React.Fragment key={impact}>
                    <div className="flex items-center justify-center font-medium p-2">
                      {5 - impact}
                    </div>
                    {Array.from({ length: 5 }, (_, likelihood) => {
                      const score = (likelihood + 1) * (5 - impact);
                      const cellRisks = risks?.filter(risk => risk.risk_score === score) || [];
                      
                      return (
                        <div
                          key={likelihood}
                          className={`p-2 rounded border min-h-[60px] ${getRiskColor(score)} bg-opacity-20 flex flex-col justify-center items-center`}
                        >
                          <div className="text-xs font-medium text-center">
                            {getRiskLabel(score)}
                          </div>
                          <div className="text-xs mt-1">
                            {cellRisks.length} Risiken
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Auswirkung (5 = Hoch, 1 = Niedrig)</span>
                <span>Wahrscheinlichkeit (1 = Niedrig, 5 = Hoch)</span>
              </div>
            </div>

            {/* Legende */}
            <div className="flex justify-center gap-4 mb-6">
              {[
                { color: 'bg-green-500', label: 'Minimal (1-4)' },
                { color: 'bg-blue-500', label: 'Niedrig (5-9)' },
                { color: 'bg-yellow-500', label: 'Mittel (10-14)' },
                { color: 'bg-orange-500', label: 'Hoch (15-19)' },
                { color: 'bg-red-500', label: 'Kritisch (20-25)' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded ${item.color}`}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risiken-Liste */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Risiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {risks?.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{risk.risk_title}</h4>
                        <Badge className={`text-white ${getRiskColor(risk.risk_score)}`}>
                          Score: {risk.risk_score}
                        </Badge>
                        <Badge variant="outline">
                          {risk.risk_category}
                        </Badge>
                        <Badge variant="secondary">
                          {risk.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Wahrscheinlichkeit: {risk.likelihood}/5</span>
                        <span>Auswirkung: {risk.impact}/5</span>
                        {risk.department && <span>Abteilung: {risk.department}</span>}
                        {risk.next_review_date && (
                          <span>Nächste Überprüfung: {new Date(risk.next_review_date).toLocaleDateString('de-DE')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {risk.residual_risk_score && risk.residual_risk_score < risk.risk_score && (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                      {risk.residual_risk_score && risk.residual_risk_score > risk.risk_score && (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      )}
                      {risk.residual_risk_score && risk.residual_risk_score === risk.risk_score && (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {risks?.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">Keine Risiken identifiziert</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Kompakte Ansicht für Dashboard
  return (
    <div className="grid grid-cols-6 gap-2 text-sm">
      <div></div>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="text-center font-medium p-1 text-xs">
          {i + 1}
        </div>
      ))}
      
      {Array.from({ length: 5 }, (_, impact) => (
        <React.Fragment key={impact}>
          <div className="flex items-center justify-center font-medium p-1 text-xs">
            {5 - impact}
          </div>
          {Array.from({ length: 5 }, (_, likelihood) => {
            const score = (likelihood + 1) * (5 - impact);
            const cellRisks = risks?.filter(risk => risk.risk_score === score) || [];
            
            return (
              <div
                key={likelihood}
                className={`p-2 rounded border min-h-[40px] ${getRiskColor(score)} bg-opacity-30 flex items-center justify-center`}
              >
                <span className="text-xs font-medium">{cellRisks.length}</span>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
