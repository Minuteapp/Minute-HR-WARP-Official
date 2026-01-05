
import { useState } from 'react';
import { toast } from 'sonner';
import ArchiveStatsCards from '../archive/ArchiveStatsCards';
import DigitalArchivingInfo from '../archive/DigitalArchivingInfo';
import ArchiveSearchBar from '../archive/ArchiveSearchBar';
import ArchiveTable from '../archive/ArchiveTable';
import ArchiveRulesSection from '../archive/ArchiveRulesSection';
import ComplianceInfoBox from '../archive/ComplianceInfoBox';

interface ArchiveEntry {
  id: string;
  archiveId: string;
  expenseDate: Date;
  employeeName: string;
  category: string;
  description: string;
  project?: string;
  amount: number;
  archivedAt: Date;
  retainUntil: Date;
  status: 'archived';
}

interface ArchiveStats {
  totalArchived: number;
  thisYear: number;
  totalVolume: number;
  retentionPeriod: string;
}

const ArchiveTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Empty data - will be populated from database
  const [entries] = useState<ArchiveEntry[]>([]);
  const [stats] = useState<ArchiveStats>({
    totalArchived: 0,
    thisYear: 0,
    totalVolume: 0,
    retentionPeriod: '10 Jahre'
  });

  const handleExport = () => {
    toast.success('Archiv-Export wird vorbereitet...');
  };

  const handleView = (id: string) => {
    toast.info(`Archiveintrag ${id} wird angezeigt...`);
  };

  const handleDownload = (id: string) => {
    toast.success(`Archiveintrag ${id} wird heruntergeladen...`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <ArchiveStatsCards stats={stats} />

      {/* Digital Archiving Info */}
      <DigitalArchivingInfo />

      {/* Search Bar */}
      <ArchiveSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onExport={handleExport}
      />

      {/* Archive Table */}
      <ArchiveTable
        entries={entries}
        onView={handleView}
        onDownload={handleDownload}
      />

      {/* Archive Rules */}
      <ArchiveRulesSection />

      {/* Compliance Info */}
      <ComplianceInfoBox />
    </div>
  );
};

export default ArchiveTab;
