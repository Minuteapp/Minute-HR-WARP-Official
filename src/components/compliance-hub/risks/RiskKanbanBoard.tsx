// Compliance Hub - Kanban Board für Risiken
import React from 'react';
import { RiskKanbanCard } from './RiskKanbanCard';
import { ComplianceRisk } from './RiskCard';

interface RiskKanbanBoardProps {
  risks: ComplianceRisk[];
}

const columns = [
  { id: 'new', title: 'Neu', status: 'new' as const },
  { id: 'in_review', title: 'In Prüfung', status: 'in_review' as const },
  { id: 'in_progress', title: 'In Bearbeitung', status: 'in_progress' as const },
  { id: 'completed', title: 'Abgeschlossen', status: 'completed' as const }
];

export const RiskKanbanBoard: React.FC<RiskKanbanBoardProps> = ({ risks }) => {
  const getRisksByStatus = (status: ComplianceRisk['status']) => {
    return risks.filter(risk => risk.status === status);
  };

  if (risks.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.id} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <span className="text-sm text-muted-foreground bg-muted rounded-full px-2 py-0.5">0</span>
            </div>
            <div className="text-center py-8 text-sm text-muted-foreground">
              Keine Risiken
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(column => {
        const columnRisks = getRisksByStatus(column.status);
        return (
          <div key={column.id} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <span className="text-sm text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {columnRisks.length}
              </span>
            </div>
            <div className="space-y-3">
              {columnRisks.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Keine Risiken
                </div>
              ) : (
                columnRisks.map(risk => (
                  <RiskKanbanCard key={risk.id} risk={risk} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
