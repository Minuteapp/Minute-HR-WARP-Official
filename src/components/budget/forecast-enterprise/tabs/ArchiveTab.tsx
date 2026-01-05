import React, { useState } from 'react';
import { ArchiveSearchBar } from '../archive/ArchiveSearchBar';
import { ArchiveKPICards } from '../archive/ArchiveKPICards';
import { ArchivedBudgetsTable } from '../archive/ArchivedBudgetsTable';
import { AuditLogSection } from '../archive/AuditLogSection';
import { AvailableReports } from '../archive/AvailableReports';
import { DataRetentionInfo } from '../archive/DataRetentionInfo';

export const ArchiveTab = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Archiv & Historie</h2>
        <p className="text-muted-foreground">
          Zugriff auf archivierte Budgets, Berichte und Änderungsprotokolle
        </p>
      </div>

      {/* Search Bar */}
      <ArchiveSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* KPI Cards */}
      <ArchiveKPICards />

      {/* Archived Budgets Table */}
      <ArchivedBudgetsTable searchTerm={searchTerm} />

      {/* Audit Log Section */}
      <AuditLogSection />

      {/* Available Reports */}
      <AvailableReports />

      {/* Data Retention Info */}
      <DataRetentionInfo />
    </div>
  );
};
