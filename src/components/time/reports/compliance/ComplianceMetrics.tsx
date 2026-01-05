
interface ComplianceMetricsProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

export const ComplianceMetrics = ({ period }: ComplianceMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="border rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Überstunden</div>
        <div className="text-2xl font-bold mt-1">24.5h</div>
        <div className="text-sm text-muted-foreground mt-1">
          im {period === 'week' ? 'dieser Woche' : 
             period === 'month' ? 'diesem Monat' : 
             period === 'quarter' ? 'diesem Quartal' : 'diesem Jahr'}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Fehlzeiten</div>
        <div className="text-2xl font-bold mt-1">3.2%</div>
        <div className="text-sm text-muted-foreground mt-1">
          Durchschnittliche Quote
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Urlaubstage</div>
        <div className="text-2xl font-bold mt-1">127</div>
        <div className="text-sm text-muted-foreground mt-1">
          Noch nicht genommen
        </div>
      </div>
    </div>
  );
};
