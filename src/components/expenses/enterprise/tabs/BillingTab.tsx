import { useState } from 'react';
import BillingStatsCards, { BillingStats } from '../billing/BillingStatsCards';
import BillingActionButtons from '../billing/BillingActionButtons';
import BillingStatusTabs from '../billing/BillingStatusTabs';
import { BillingEntry } from '../billing/BillingTable';
import AccountingExportSection from '../billing/AccountingExportSection';
import PayrollIntegrationBox from '../billing/PayrollIntegrationBox';
import AccountingPeriodsSection from '../billing/AccountingPeriodsSection';
import { toast } from 'sonner';

const BillingTab = () => {
  const [entries] = useState<BillingEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Dezember 2024');
  const [selectedCostCenter, setSelectedCostCenter] = useState('Automatisch zuordnen');

  const stats: BillingStats = {
    pending: { 
      amount: entries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0), 
      employees: entries.filter(e => e.status === 'pending').length 
    },
    processing: { 
      amount: entries.filter(e => e.status === 'processing').reduce((sum, e) => sum + e.amount, 0), 
      employees: entries.filter(e => e.status === 'processing').length 
    },
    reimbursed: { 
      amount: entries.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0), 
      employees: entries.filter(e => e.status === 'reimbursed').length 
    },
  };

  const handleBatchPayment = () => {
    toast.info('Sammelauszahlung starten');
  };

  const handleExport = () => {
    toast.info('Export für Buchhaltung');
  };

  const handleView = (id: string) => {
    toast.info(`Abrechnung ${id} anzeigen`);
  };

  const handleSend = (id: string) => {
    toast.info(`Abrechnung ${id} senden`);
  };

  const handleAccountingExport = (type: 'datev' | 'sap' | 'csv') => {
    toast.success(`${type.toUpperCase()} Export gestartet`);
  };

  const handlePayrollSettings = () => {
    toast.info('Payroll-Einstellungen öffnen');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BillingStatsCards stats={stats} />
      </div>
      
      <BillingActionButtons 
        onBatchPayment={handleBatchPayment} 
        onExport={handleExport} 
      />
      
      <BillingStatusTabs 
        entries={entries} 
        onView={handleView} 
        onSend={handleSend} 
      />
      
      <AccountingExportSection onExport={handleAccountingExport} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayrollIntegrationBox onSettings={handlePayrollSettings} />
        <AccountingPeriodsSection
          selectedPeriod={selectedPeriod}
          selectedCostCenter={selectedCostCenter}
          onPeriodChange={setSelectedPeriod}
          onCostCenterChange={setSelectedCostCenter}
        />
      </div>
    </div>
  );
};

export default BillingTab;
