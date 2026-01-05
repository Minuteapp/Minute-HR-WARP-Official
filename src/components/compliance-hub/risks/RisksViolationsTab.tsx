// Compliance Hub - Risiken & Verstöße Tab (Vollständig)
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import { RiskFilters } from './RiskFilters';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { RiskCard, ComplianceRisk } from './RiskCard';
import { RiskKanbanBoard } from './RiskKanbanBoard';

interface RisksViolationsTabProps {
  risks?: ComplianceRisk[];
  analysisText?: string;
  recommendations?: string[];
}

export const RisksViolationsTab: React.FC<RisksViolationsTabProps> = ({
  risks = [],
  analysisText,
  recommendations = []
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const filteredRisks = risks.filter(risk => {
    const statusMatch = selectedStatus === 'all' || risk.status === selectedStatus;
    const severityMatch = selectedSeverity === 'all' || risk.severity === selectedSeverity;
    return statusMatch && severityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Risiken & Verstöße</h2>
          <p className="text-sm text-muted-foreground">Zentrale Erfassung & Steuerung aller Compliance-Risiken</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
          >
            <List className="h-4 w-4 mr-1" />
            Liste
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className={viewMode === 'kanban' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Kanban
          </Button>
        </div>
      </div>

      {/* Filter */}
      <RiskFilters
        selectedStatus={selectedStatus}
        selectedSeverity={selectedSeverity}
        onStatusChange={setSelectedStatus}
        onSeverityChange={setSelectedSeverity}
        resultCount={filteredRisks.length}
      />

      {/* KI-Risikoanalyse */}
      <RiskAnalysisCard
        analysisText={analysisText}
        recommendations={recommendations}
      />

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredRisks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Keine Risiken vorhanden.</p>
              <p className="text-sm">Risiken werden hier angezeigt, sobald sie erfasst werden.</p>
            </div>
          ) : (
            filteredRisks.map(risk => (
              <RiskCard key={risk.id} risk={risk} />
            ))
          )}
        </div>
      ) : (
        <RiskKanbanBoard risks={filteredRisks} />
      )}
    </div>
  );
};
