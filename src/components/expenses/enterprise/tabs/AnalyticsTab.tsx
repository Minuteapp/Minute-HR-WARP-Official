
import { useState } from 'react';
import { toast } from 'sonner';
import AnalyticsHeader from '../analytics/AnalyticsHeader';
import ReportTypeCards from '../analytics/ReportTypeCards';
import CostTrendChart from '../analytics/CostTrendChart';
import BudgetDeviationChart from '../analytics/BudgetDeviationChart';
import BudgetDeviationList from '../analytics/BudgetDeviationList';
import SavingsPotentialSection from '../analytics/SavingsPotentialSection';
import KeyInsightsSection from '../analytics/KeyInsightsSection';
import ExportFormatsSection from '../analytics/ExportFormatsSection';
import ScheduledReportsSection from '../analytics/ScheduledReportsSection';
import NewScheduledReportDialog from '../analytics/NewScheduledReportDialog';

interface CostTrendData {
  month: string;
  arbeitsmittel: number;
  bewirtung: number;
  reisekosten: number;
  software: number;
}

interface BudgetDeviationData {
  department: string;
  planned: number;
  actual: number;
}

interface BudgetDeviation {
  department: string;
  actual: number;
  planned: number;
  deviationPercent: number;
}

interface SavingsPotential {
  id: string;
  category: string;
  tip: string;
  amount: number;
}

interface KeyInsight {
  id: string;
  number: number;
  title: string;
  description: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  schedule: string;
  recipient: string;
}

const AnalyticsTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this_year');
  const [selectedReport, setSelectedReport] = useState('category');
  const [newReportDialogOpen, setNewReportDialogOpen] = useState(false);

  // Empty data arrays - will be populated from database
  const [costTrendData] = useState<CostTrendData[]>([]);
  const [budgetChartData] = useState<BudgetDeviationData[]>([]);
  const [budgetDeviationList] = useState<BudgetDeviation[]>([]);
  const [savingsPotentials] = useState<SavingsPotential[]>([]);
  const [keyInsights] = useState<KeyInsight[]>([]);
  const [scheduledReports] = useState<ScheduledReport[]>([]);

  const totalSavings = savingsPotentials.reduce((sum, item) => sum + item.amount, 0);

  const handleExport = () => {
    toast.success('Export wird vorbereitet...');
  };

  const handleDetailsClick = () => {
    toast.info('Details-Ansicht wird geöffnet...');
  };

  const handleFormatExport = (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    toast.success(`${format.toUpperCase()}-Export wird erstellt...`);
  };

  const handleNewReport = (data: { name: string; reportType: string; frequency: string; recipient: string }) => {
    toast.success(`Report "${data.name}" wurde erstellt`);
  };

  const handleViewReport = (id: string) => {
    toast.info(`Report ${id} wird angezeigt...`);
  };

  const handleDownloadReport = (id: string) => {
    toast.success(`Report ${id} wird heruntergeladen...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onExport={handleExport}
      />

      {/* Report Type Cards */}
      <ReportTypeCards
        selectedReport={selectedReport}
        onSelectReport={setSelectedReport}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostTrendChart
          data={costTrendData}
          onDetailsClick={handleDetailsClick}
        />
        <BudgetDeviationChart
          data={budgetChartData}
          onDetailsClick={handleDetailsClick}
        />
      </div>

      {/* Budget Deviation List & Savings Potential */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetDeviationList data={budgetDeviationList} />
        <SavingsPotentialSection
          data={savingsPotentials}
          totalSavings={totalSavings}
        />
      </div>

      {/* Key Insights */}
      <KeyInsightsSection insights={keyInsights} />

      {/* Export Formats */}
      <ExportFormatsSection onExport={handleFormatExport} />

      {/* Scheduled Reports */}
      <ScheduledReportsSection
        reports={scheduledReports}
        onNewReport={() => setNewReportDialogOpen(true)}
        onViewReport={handleViewReport}
        onDownloadReport={handleDownloadReport}
      />

      {/* New Report Dialog */}
      <NewScheduledReportDialog
        open={newReportDialogOpen}
        onOpenChange={setNewReportDialogOpen}
        onSubmit={handleNewReport}
      />
    </div>
  );
};

export default AnalyticsTab;
