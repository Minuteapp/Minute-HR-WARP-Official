
import { BarChart3, LayoutGrid, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import ReportTypeCard from './ReportTypeCard';

interface ReportTypeCardsProps {
  selectedReport: string;
  onSelectReport: (reportId: string) => void;
}

const reportTypes = [
  {
    id: 'category',
    icon: BarChart3,
    title: 'Ausgaben nach Kategorie',
    description: 'Detaillierte Aufschlüsselung aller Ausgaben nach Kategorien'
  },
  {
    id: 'project',
    icon: LayoutGrid,
    title: 'Ausgaben nach Projekt',
    description: 'Projektbezogene Kostenanalyse mit Budget-Vergleich'
  },
  {
    id: 'budget',
    icon: TrendingUp,
    title: 'Budgetabweichungen',
    description: 'Analyse von Plan-Ist-Abweichungen über alle Bereiche'
  },
  {
    id: 'vat',
    icon: FileText,
    title: 'MwSt.-Übersicht',
    description: 'Vorsteuerabzug und MwSt.-Reporting'
  },
  {
    id: 'violations',
    icon: AlertTriangle,
    title: 'Richtlinienverstöße',
    description: 'Übersicht aller Verstöße gegen Unternehmensrichtlinien'
  },
  {
    id: 'forecast',
    icon: TrendingUp,
    title: 'Forecast-Auswirkungen',
    description: 'Einfluss der Ausgaben auf Budgetplanung und Forecasts'
  }
];

const ReportTypeCards = ({ selectedReport, onSelectReport }: ReportTypeCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportTypes.map((report) => (
        <ReportTypeCard
          key={report.id}
          icon={report.icon}
          title={report.title}
          description={report.description}
          isSelected={selectedReport === report.id}
          onClick={() => onSelectReport(report.id)}
        />
      ))}
    </div>
  );
};

export default ReportTypeCards;
