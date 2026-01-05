import React from 'react';
import { ConnectionsKPICards } from '../connections/ConnectionsKPICards';
import { ModuleConnectionsGrid } from '../connections/ModuleConnectionsGrid';
import { UpdateChainsList } from '../connections/UpdateChainsList';
import { FinancialImpactTable } from '../connections/FinancialImpactTable';
import { AddModuleEmptyState } from '../connections/AddModuleEmptyState';

export const ConnectionsTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Verknüpfungen</h2>
        <p className="text-muted-foreground">
          Module-Integration für automatische Budget-Updates
        </p>
      </div>

      {/* KPI Cards */}
      <ConnectionsKPICards />

      {/* Module Connections Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Verknüpfte Module</h3>
        <ModuleConnectionsGrid />
      </div>

      {/* Update Chains */}
      <UpdateChainsList />

      {/* Financial Impact Table */}
      <FinancialImpactTable />

      {/* Add Module Empty State */}
      <AddModuleEmptyState />
    </div>
  );
};
