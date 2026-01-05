import { FileSpreadsheet, FileText, Database } from 'lucide-react';
import ExportCard from './ExportCard';
import { toast } from 'sonner';

const DataExportSection = () => {
  const exports = [
    {
      title: 'Excel Export',
      description: 'Alle Projektdaten als Excel-Datei',
      format: 'XLSX',
      icon: FileSpreadsheet,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'PDF Report',
      description: 'Formatierter Report als PDF',
      format: 'PDF',
      icon: FileText,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'CSV Export',
      description: 'Rohdaten für weitere Analysen',
      format: 'CSV',
      icon: Database,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  const handleExport = (title: string, format: string) => {
    toast.success(`${format}-Export wird erstellt...`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Daten exportieren</h3>
        <p className="text-sm text-muted-foreground">
          Exportieren Sie Projektdaten in verschiedenen Formaten
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exports.map((exp) => (
          <ExportCard
            key={exp.title}
            {...exp}
            onExport={() => handleExport(exp.title, exp.format)}
          />
        ))}
      </div>
    </div>
  );
};

export default DataExportSection;
