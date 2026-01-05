import { FileText, PieChart, TrendingUp, Users } from 'lucide-react';
import ReportTemplateCard from './ReportTemplateCard';
import { toast } from 'sonner';

const ReportTemplates = () => {
  const templates = [
    {
      title: 'Portfolio Status Report',
      description: 'Übersicht aller aktiven Projekte mit KPIs und Fortschritt',
      frequency: 'Wöchentlich',
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Budget & Kosten Report',
      description: 'Detaillierte Analyse der Budget-Auslastung und Prognosen',
      frequency: 'Monatlich',
      icon: PieChart,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Ressourcen-Auslastung',
      description: 'Kapazitätsplanung und Ressourcen-Allokation über alle Projekte',
      frequency: 'Wöchentlich',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Risiko & Compliance',
      description: 'Risiko-Register und Compliance-Status aller Projekte',
      frequency: 'Monatlich',
      icon: TrendingUp,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const handlePreview = (title: string) => {
    toast.info(`Vorschau für "${title}" wird geladen...`);
  };

  const handleGenerate = (title: string) => {
    toast.success(`Report "${title}" wird generiert...`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Report-Templates</h3>
        <p className="text-sm text-muted-foreground">
          Vordefinierte Templates für verschiedene Report-Typen
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <ReportTemplateCard
            key={template.title}
            {...template}
            onPreview={() => handlePreview(template.title)}
            onGenerate={() => handleGenerate(template.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportTemplates;
