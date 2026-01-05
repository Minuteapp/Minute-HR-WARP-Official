import ExportCard from './ExportCard';

interface AccountingExportSectionProps {
  onExport: (type: 'datev' | 'sap' | 'csv') => void;
}

const AccountingExportSection = ({ onExport }: AccountingExportSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Buchhaltungs-Export</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExportCard name="DATEV Export" icon="datev" onExport={() => onExport('datev')} />
        <ExportCard name="SAP Export" icon="sap" onExport={() => onExport('sap')} />
        <ExportCard name="CSV Export" icon="csv" onExport={() => onExport('csv')} />
      </div>
    </div>
  );
};

export default AccountingExportSection;
